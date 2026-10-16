#!/usr/bin/env python3
"""Conta testes sem assert nos arquivos de teste lidos do stdin (um por linha).

Um teste e `def test_*` em Python ou uma chamada `it(` / `test(` em JS/TS,
incluindo os modificadores encadeados (`test.concurrent`, `it.each([...])`).
O corpo precisa conter um assert; sem isso o teste passa com o codigo quebrado
e so serve para inflar cobertura.

O corpo e delimitado aqui, nao pelo lizard: ele erra a linha final de arrow
function com callback aninhado, e o assert que vem depois do erro ficava de
fora. Em JS o corpo vai da linha de abertura ate as chaves fecharem; em Python,
ate a indentacao voltar ao nivel do `def`.

String e comentario saem antes da busca pelo assert. Sem isso um `// assert
aqui depois` valida um teste vazio, que e o oposto do que a metrica existe
para pegar.
"""

import re
import sys

# Modificadores que ainda deixam a chamada ser um teste. Lista fechada de
# proposito: `\w+` aqui engolia os hooks do Playwright (`test.afterAll`,
# `test.beforeEach`), que nao tem assert nenhum e inflavam a metrica.
# `todo` fica de fora porque e placeholder declarado, sem corpo para medir.
MODIFICADOR = r"(?:\.(?:only|skip|concurrent|sequential|serial|failing|each|runIf|skipIf|for))"
# `test`, `it.concurrent`, `it.each([...])(`, `test.each`tabela`(`.
#
# O `\(\s*,` no fim exige que o primeiro argumento seja o titulo, que a essa
# altura ja virou vazio junto com as outras strings. E o que separa a
# declaracao `test.skip('nome', fn)` do skip condicional em runtime
# `test.skip(!disponivel, 'motivo')`, que mora DENTRO de um teste e cujo corpo
# falso ia ate o fim do teste de verdade.
ABRE_JS = re.compile(rf"^\s*(?:it|test){MODIFICADOR}*\s*(?:\([^)]*\)|`[^`]*`)?\s*\(\s*,")
ABRE_PY = re.compile(r"^(\s*)(async\s+)?def\s+test\w*\s*\(")
STRING = re.compile(r"'[^']*'|\"[^\"]*\"|`[^`]*`")
LINHA_COMENTADA_JS = re.compile(r"//.*$")
LINHA_COMENTADA_PY = re.compile(r"#.*$")
BLOCO_INLINE = re.compile(r"/\*.*?\*/")
MULTI_INLINE = re.compile(r'""".*?"""|\'\'\'.*?\'\'\'')
ASSERT = re.compile(
    # `assert x`, `assertEqual(`, `assert_called_once(` — o underscore do
    # unittest.mock nao pode cair na fronteira de palavra do primeiro caso.
    r"\bassert(\b|\w*\()"
    r"|\bexpect[.(]|\bpytest\.raises\(|\.toThrow|\bexpectTypeOf\("
    # Playwright: esperar URL/seletor falha quando nao chega, e assert implicito.
    r"|\.waitFor(URL|Selector|Response|Request)\("
)


def sem_comentario(linhas, py):
    """Remove string e comentario de cada linha, preservando a contagem.

    Multi-linha (`\"\"\"` e `'''` no Python, `/* */` no JS) e rastreado por
    estado: a linha de dentro vira vazia. Vazia nao encerra corpo de teste em
    Python, entao a delimitacao por indentacao sobrevive a uma docstring
    dedentada.

    ponytail: template literal de varias linhas em JS nao e rastreado; um
    `assert` dentro dele contaria como assert de verdade. Erra a favor de
    aprovar, que e o lado seguro para uma metrica que reprova PR.
    """
    abrem = ('"""', "'''") if py else ("/*",)
    fecha_com = {'"""': '"""', "'''": "'''", "/*": "*/"}
    comentario = LINHA_COMENTADA_PY if py else LINHA_COMENTADA_JS

    limpas, aberto, recuo = [], None, 0
    for linha in linhas:
        if aberto:
            fim = linha.find(fecha_com[aberto])
            if fim < 0:
                limpas.append("")
                continue
            # O resto da linha volta com a indentacao de quem ABRIU a string,
            # nao com a dela. O conteudo de uma string multi-linha costuma ser
            # dedentado, entao o `,` depois do `"""` de fechamento cairia na
            # coluna zero e encerraria ali o corpo do teste em Python.
            linha, aberto = " " * recuo + linha[fim + len(fecha_com[aberto]) :], None

        # O que abre e fecha na mesma linha sai primeiro: sem isso o `"""` de
        # uma docstring de uma linha so seria lido como abertura e engoliria o
        # resto do arquivo.
        limpa = BLOCO_INLINE.sub("", MULTI_INLINE.sub("", linha))
        for marca in abrem:
            if marca in limpa:
                recuo = len(limpa) - len(limpa.lstrip())
                limpa, aberto = limpa[: limpa.index(marca)], marca
                break
        limpas.append(comentario.sub("", STRING.sub("", limpa)))
    return limpas


def corpo_js(linhas, i):
    """Da linha i ate as chaves abertas nela fecharem."""
    saldo, viu_chave = 0, False
    for j in range(i, len(linhas)):
        saldo += linhas[j].count("{") - linhas[j].count("}")
        viu_chave = viu_chave or "{" in linhas[j]
        # Sem chave ainda: titulo quebrado em varias linhas (`'a' +`) ou teste
        # de uma linha sem bloco, que termina no `)`.
        if saldo <= 0 and (viu_chave or linhas[j].rstrip().endswith(")")):
            return linhas[i : j + 1]
    return linhas[i:]


def corpo_py(linhas, i, indent):
    # Assinatura pode ocupar varias linhas: o corpo comeca depois do `:`.
    j = i
    while j < len(linhas) and not linhas[j].rstrip().endswith(":"):
        j += 1
    j += 1
    while j < len(linhas):
        linha = linhas[j]
        if linha.strip() and len(linha) - len(linha.lstrip()) <= indent:
            break
        j += 1
    return linhas[i:j]


def testes(caminho):
    """Devolve o corpo ja limpo de cada teste do arquivo."""
    py = caminho.endswith(".py")
    with open(caminho, encoding="utf-8", errors="replace") as arquivo:
        brutas = arquivo.read().splitlines()
    # A deteccao de abertura roda no texto limpo: `// it('x', ...)` comentado
    # nao e teste. A docstring do Python vira linha vazia, e vazia nao encerra
    # o corpo, entao a delimitacao por indentacao continua valendo.
    linhas = sem_comentario(brutas, py)
    for i, linha in enumerate(linhas):
        if py:
            if m := ABRE_PY.match(linha):
                yield corpo_py(linhas, i, len(m.group(1)))
        elif ABRE_JS.match(linha):
            yield corpo_js(linhas, i)


def main():
    total = 0
    for caminho in (l.strip() for l in sys.stdin if l.strip()):
        total += sum(1 for corpo in testes(caminho) if not ASSERT.search("\n".join(corpo)))
    print(total)


if __name__ == "__main__":
    main()

"use client";

import { useEffect, useState } from "react";
import { getMeAction } from "@/actions/account";

export type Me = Awaited<ReturnType<typeof getMeAction>>;

// Conta logada para componentes cliente. undefined = carregando, null = convidado.
// onLoad roda uma vez quando a conta chega (ex: preencher formulário).
export function useMe(onLoad?: (me: NonNullable<Me>) => void) {
  const [me, setMe] = useState<Me | undefined>(undefined);
  useEffect(() => {
    getMeAction()
      .then((m) => {
        setMe(m);
        if (m) onLoad?.(m);
      })
      .catch(() => setMe(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega só uma vez
  }, []);
  return me;
}

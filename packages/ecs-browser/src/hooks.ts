import { Component, Has, removeComponent } from "@latticexyz/recs";
import { useQuery } from "@latticexyz/std-client";
import { useCallback, useEffect, useState } from "react";
import * as shiki from "shiki";

shiki.setCDN("https://unpkg.com/shiki/");

export function useClearDevHighlights(devHighlightComponent: Component) {
  const highlightedEntities = useQuery([Has(devHighlightComponent)]);

  return useCallback(() => {
    if (!highlightedEntities) return;
    for (const entity of highlightedEntities) {
      removeComponent(devHighlightComponent, entity);
    }
  }, [highlightedEntities]);
}

export function useShiki(code: string, lang: shiki.Lang) {
  const [html, htmlSet] = useState<string>();
  const [tokens, tokenSet] = useState<shiki.IThemedToken[][]>();

  useEffect(() => {
    async function handler() {
      try {
        const highlighter = await shiki.getHighlighter({ theme: "dracula-soft", langs: [lang] });

        htmlSet(highlighter.codeToHtml(code, { lang }));
        tokenSet(highlighter.codeToThemedTokens(code, lang));
      } catch (error) {
        console.error(error);
      }
    }
    handler();
  }, [code]);

  return {
    html,
    tokens,
  };
}

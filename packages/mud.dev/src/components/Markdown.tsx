import { useLocation } from "react-router-dom";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { useEffect, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord as codeStyle } from "react-syntax-highlighter/dist/esm/styles/prism";

export function Markdown(args: { path?: string }) {
  const [text, setText] = useState("");
  const location = useLocation();
  const path = useMemo(() => {
    const p = args.path || location.pathname || "";
    return p.substring(p.length - 3) === ".md" ? p : p + ".md";
  }, [args, location]);

  useEffect(() => {
    (async () => {
      try {
        const url = require(`../md${path}`);
        const response = await fetch(url);
        const content = await response.text();
        setText(content);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [path]);

  return (
    <Container>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, "")}
                style={codeStyle as any}
                language={match[1]}
                PreTag="div"
                {...props}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </Container>
  );
}

const Container = styled.div`
  padding: 0 100px 100px 100px;
  max-width: 1000px;
  min-width: 400px;

  @media (max-width: 600px) {
    padding: 40px;
  }

  p {
    margin: 25px 0;
  }

  p,
  ul,
  ol,
  a {
    font-size: 18px;
  }

  h1 {
    font-family: "Space Grotesk", sans-serif;
    font-size: 70px;
    padding-top: 45px;
    color: var(--primary-color);
  }

  h2 {
    font-size: 28px;
    padding-top: 45px;
  }

  img {
    max-width: 100%;
  }

  code {
    color: rgb(248, 248, 242);
    background: rgb(46, 52, 64);
    padding: 0.1em 0.3em;
    overflow: auto;
    border-radius: 0.3em;
    font-family: "Fira Code", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
    font-size: 85%;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    overflow-wrap: normal;
    line-height: 1.5;
    tab-size: 4;
    hyphens: none;
  }

  pre {
    code {
      background-color: unset;
    }
  }
`;

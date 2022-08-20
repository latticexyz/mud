import { useParams } from "react-router-dom";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { useEffect, useMemo, useState } from "react";

export function Markdown(args: { post?: string }) {
  const [text, setText] = useState("");
  const params = useParams();
  const post = useMemo(() => args.post || params.post, [args, params]);

  useEffect(() => {
    (async () => {
      try {
        const url = require(`../blog/${post}.md`);
        const response = await fetch(url);
        const content = await response.text();
        setText(content);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [post]);

  return (
    <Container>
      <ReactMarkdown>{text}</ReactMarkdown>
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
`;

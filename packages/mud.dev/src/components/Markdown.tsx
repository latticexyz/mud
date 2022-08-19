import { useParams } from "react-router-dom";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";

export function Markdown() {
  const [text, setText] = useState("");
  const { post } = useParams();

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
  padding: 100px;
`;

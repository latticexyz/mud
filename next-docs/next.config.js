import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

export default withNextra({
  async redirects() {
    return [
      {
        source: "/what-is-mud",
        destination: "/introduction",
        permanent: true,
      },
      {
        source: "/quick-start",
        destination: "/quickstart",
        permanent: true,
      },   
      {
        source: "/store",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/store/installation",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/store/reading-and-writing",
        destination: "/store/table-libraries#reading-data",
        permanent: true        
      },
      {
        source: "/store/config",
        destination: "/store/table-libraries#config",
        permanent: true        
      },
      {
        source: "/store/advanced-features",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/store/indexing",
        destination: "/store/introduction",
        permanent: true        
      },           
      {
        source: "/store/spec",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/store/gas-efficiency",
        destination: "/store/introduction",
        permanent: true        
      },  
      {
        source: "/store/using-without-world",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/store/internals",
        destination: "/store/introduction",
        permanent: true        
      },
      /*           
      {
        source: "https://mud.dev/world",
        destination: "http://localhost:3000/world/introduction",
        permanent: true        
      },
      {
        source: "https://mud.dev/world/world-101",
        destination: "http://localhost:3000/world/introduction",
        permanent: true        
      },
      {
        source: "https://mud.dev/world/config",
        destination: "http://localhost:3000/cli/config",
        permanent: true        
      },
      {
        source: "https://mud.dev/world/deployer",
        destination: "http://localhost:3000/cli/deploy",
        permanent: true        
      },           
      {
        source: "https://mud.dev/world/subsystems",
        destination: "http://localhost:3000/world/introduction",
        permanent: true        
      },
      {
        source: "https://mud.dev/world/community-computers",
        destination: "http://localhost:3000/world/introduction",
        permanent: true        
      },
      {
        source: "https://mud.dev/world/querying",
        destination: "http://localhost:3000/state-query/introduction",
        permanent: true        
      },
      {
        source: "https://mud.dev/world/internals",
        destination: "http://localhost:3000/world/introduction",
        permanent: true        
      },           
      {
        source: "https://mud.dev/client-side",
        destination: "http://localhost:3000/state-query/typescript/recs",
        permanent: true        
      },
      {
        source: "https://mud.dev/indexer",
        destination: "http://localhost:3000/services/indexer",
        permanent: true        
      },            
      {
        source: "https://mud.dev/cli",
        destination: "http://localhost:3000/cli/tablegen",
        permanent: true        
      },
      {
        source: "https://mud.dev/ecs",
        destination: "/guides/emojimon/1-preface-the-ecs-model.mdx",
        permanent: true        
      },           
      {
        source: "https://mud.dev/plugins",
        destination: "http://localhost:3000/world/introduction",
        permanent: true        
      },
      {
        source: "https://mud.dev/tutorials",
        destination: "http://localhost:3000/guides/hello-world",
        permanent: true        
      },
      {
        source: "https://mud.dev/tutorials/emojimon",
        destination: "/guides/emojimon",
        permanent: true        
      },      
      {
        source: "https://mud.dev/tutorials/emojimon/preface-the-ecs-model",
        destination: "/guides/emojimon/1-preface-the-ecs-model.mdx",
        permanent: true        
      },
      {
        source: "",
        destination: "",
        permanent: true        
      },
      {
        source: "",
        destination: "",
        permanent: true        
      },
      {
        source: "",
        destination: "",
        permanent: true        
      },      
      {
        source: "",
        destination: "",
        permanent: true        
      },
      {
        source: "",
        destination: "",
        permanent: true        
      },            
      */                
    ];
  },
});

import { useState, ChangeEventHandler } from "react";
import { useNetwork, useContractRead, usePrepareContractWrite, useContractWrite, useContractEvent } from "wagmi";

type AnyAttrType = {
  str: string | undefined;
};

// To get eth to your user:
// cast send --private-key $PRIVATE_KEY --value 1ether 0x7D3bAC5b641A26Ed66ec764CbBf6988F14217D60

const BulletinBoard = () => {
  const [contractAddr, setContractAddr] = useState("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const [newPost, setNewPost] = useState("");

  const contractAddrChange: ChangeEventHandler<HTMLInputElement> = (evt) => setContractAddr(evt.target.value);
  const newPostChange: ChangeEventHandler<HTMLInputElement> = (evt) => setNewPost(evt.target.value);

  const nextIndex = useContractRead({
    address: contractAddr,
    abi: [
      {
        inputs: [],
        stateMutability: "view",
        type: "function",
        name: "nextIndex",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
      },
    ],
    functionName: "nextIndex",
    watch: true,
  });

  const preparedTx = usePrepareContractWrite({
    address: contractAddr,
    abi: [
      {
        type: "function",
        name: "post",
        inputs: [
          {
            name: "message",
            type: "string",
            internalType: "string",
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
    ],
    functionName: "post",
    args: [newPost],
  });
  const workingTx = useContractWrite(preparedTx.config);

  return (
    <>
      <h2>Bulletin Board</h2>
      Contract address:
      <input type="text" size="50" value={contractAddr} onChange={contractAddrChange} />
      <br />
      <br />
      Next index: {Number(nextIndex.data)}
      <br />
      <br />
      <table border="true">
        <tr>
          <th>Message</th>
          <th>Sender</th>
          <th>At</th>
        </tr>
        {[...Array(Number(nextIndex.data))].map((x, i) => (
          <tr>
            <ShowPost address={contractAddr} index={i} />
          </tr>
        ))}
      </table>
      <h3>New post</h3>
      <input type="text" size="50" value={newPost} onChange={newPostChange} />
      <br />
      <button disabled={!workingTx.write} onClick={workingTx.write}>
        Post new message
      </button>
    </>
  );
};

const ShowPost = (attrs: AnyAttrType) => {
  const contractAddr = attrs.address;
  const postIndex = attrs.index;

  const getPost = useContractRead({
    address: contractAddr,
    abi: [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_index",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
        name: "getPost",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
          {
            internalType: "address",
            name: "",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
      },
    ],
    functionName: "getPost",
    watch: true,
    args: [postIndex],
  });

  return (
    getPost.data && (
      <>
        <td>{getPost.data[0]}</td>
        <td>{getPost.data[1]}</td>
        <td>{new Date(1000 * Number(getPost.data[2])).toString()}</td>
      </>
    )
  );
};

/*
const ShowObject = (attrs: ShowObjectAttrsType) => {
  const keys = Object.keys(attrs.object);
  const funs = keys.filter((k) => typeof attrs.object[k] == "function");
  return (
    <>
      <details>
        <summary>{attrs.name}</summary>
        <pre>{JSON.stringify(attrs.object, null, 2)}</pre>
        {funs.length > 0 && (
          <>
            Functions:
            <ul>
              {funs.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </>
        )}
      </details>
    </>
  );
};
*/

export { BulletinBoard };

"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export function DozerListener() {
  const [data, setData] = useState<unknown[]>([]);
  const { worldAddress } = useParams();

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_DOZER_URL}/q-live?address=${worldAddress}&query=select+entityId+from+Position+limit+10`,
    );

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData((prevData) => [...prevData, newData]);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [worldAddress]);

  return (
    <div>
      <h2>Dozer updates:</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
}

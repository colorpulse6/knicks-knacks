import React from "react";
import { NextPageContext } from "next";
import dynamic from "next/dynamic";

// The dynamic import prevents static generation of error pages
const NextError = dynamic(() => import("next/error"), { ssr: false });

function Error({ statusCode }: { statusCode: number }) {
  return <NextError statusCode={statusCode} />;
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

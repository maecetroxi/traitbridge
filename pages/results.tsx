import { GetServerSideProps } from "next";

const ResultsPage = () => null;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/profile?view=details",
      permanent: false,
    },
  };
};

export default ResultsPage;

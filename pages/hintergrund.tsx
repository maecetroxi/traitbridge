import { GetServerSideProps } from "next";

const LegacyBackgroundPage = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/background",
    permanent: false,
  },
});

export default LegacyBackgroundPage;

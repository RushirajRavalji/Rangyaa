import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: '/admin/orders',
      permanent: false,
    },
  };
};

export default function AdminIndex() {
  return null;
} 
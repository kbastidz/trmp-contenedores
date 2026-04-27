'use client';

import {
  Container,
  Stack
} from '@mantine/core';

import {
  PageHeader
} from '@/components';


function Page() {
  return (
    <>
      <>
        <title>Default Dashboard | DesignSparx</title>
        <meta
          name="description"
          content="Explore our versatile dashboard website template featuring a stunning array of themes and meticulously crafted components. Elevate your web project with seamless integration, customizable themes, and a rich variety of components for a dynamic user experience. Effortlessly bring your data to life with our intuitive dashboard template, designed to streamline development and captivate users. Discover endless possibilities in design and functionality today!"
        />
      </>
      <Container fluid>
        <Stack gap="lg">
          <PageHeader title="Default dashboard" withActions={true} />
         
          
        </Stack>
      </Container>
    </>
  );
}

export default Page;
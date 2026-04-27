import {
  Group,
  Text,
} from '@mantine/core';



const FooterNav = () => {
  return (
    <Group justify="space-between">      
      <Text component="a" target="_blank">
        &copy;&nbsp;{new Date().getFullYear()}&nbsp; Lumina
      </Text>
    </Group>
  );
};

export default FooterNav;
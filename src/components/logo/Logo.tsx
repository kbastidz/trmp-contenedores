import {
  Group,
  Text,
  UnstyledButton,
  UnstyledButtonProps,
} from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import logoSrc from '../../../public/logo-no-background.png';

import classes from './Logo.module.css';

type LogoProps = {
  href?: string;
  showText?: boolean;
} & UnstyledButtonProps;

const Logo = ({ href, showText = true, ...others }: LogoProps) => {
  return (
    <UnstyledButton
      className={classes.logo}
      component={Link}
      href={href || '/'}
      {...others}
    >
      <Group gap="xs">
        <Image
          src={logoSrc}
          height={showText ? 32 : 24}
          width={showText ? 32 : 24}
          alt="design sparx logo"
        />
        {showText && <Text fw={700}>TMP Hidromecania</Text>}
      </Group>
    </UnstyledButton>
  );
};

export default Logo;

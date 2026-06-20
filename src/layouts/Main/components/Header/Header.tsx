'use client';

import {
  ActionIcon,
  Avatar,
  Flex,
  Group,
  Indicator,
  Menu,
  Stack,
  Text,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconBell,
  IconMenu2,
  IconPower,
  IconSearch,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';

import { MESSAGES } from '@/constants/messages';
import { NOTIFICATIONS } from '@/constants/notifications';
import { HeaderVariant, useSidebarConfig } from '@/contexts/theme-customizer';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useApi';

const ICON_SIZE = 20;

type HeaderNavProps = {
  toggleMobile?: () => void;
  sidebarVisible: boolean;
  onSidebarToggle: () => void;
  onSidebarShow?: () => void;
  headerVariant: HeaderVariant;
};

const HeaderNav = (props: HeaderNavProps) => {
  const {
    toggleMobile,
    headerVariant,
    sidebarVisible,
    onSidebarToggle,
    onSidebarShow,
  } = props;
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const tablet_match = useMediaQuery('(max-width: 768px)');
  const mobile_match = useMediaQuery('(max-width: 425px)');
  const sidebarConfig = useSidebarConfig();
  const router = useRouter();
  const { user } = useCurrentUser();

  // Determine text color based on header variant
  const getTextColor = () => {
    if (headerVariant === 'colored') {
      return 'white';
    }
    return undefined; // Use default theme colors
  };

  const textColor = getTextColor();

  const handleSidebarToggle = () => {
    if (mobile_match) {
      // Mobile: toggle mobile menu
      toggleMobile?.();
    } else if (sidebarConfig.overlay && !sidebarVisible) {
      // Desktop overlay mode: show sidebar if hidden
      onSidebarShow?.();
    } else {
      // Normal mode or overlay mode with visible sidebar: toggle
      onSidebarToggle();
    }
  };

  const getSidebarToggleIcon = () => {
    if (mobile_match) {
      return <IconMenu2 size={ICON_SIZE} color={textColor} />;
    }

    // Desktop: use menu icon for overlay mode or when sidebar is hidden
    if (sidebarConfig.overlay || !sidebarVisible) {
      return <IconMenu2 size={ICON_SIZE} color={textColor} />;
    }

    // Use menu icon for normal mode when sidebar is visible
    return <IconMenu2 size={ICON_SIZE} color={textColor} />;
  };

  const getSidebarToggleTooltip = () => {
    if (mobile_match) return 'Toggle menu';
    if (!sidebarVisible) return 'Show sidebar';
    return 'Hide sidebar';
  };

  const messages = MESSAGES.map((m) => (
    <Menu.Item
      key={m.id}
      style={{
        borderBottom: `1px solid ${
          colorScheme === 'dark' ? theme.colors.gray[7] : theme.colors.gray[3]
        }`,
      }}
    >
      <Flex gap="sm" align="center">
        <Avatar
          src={null}
          alt={`${m.first_name} ${m.last_name}`}
          variant="filled"
          size="sm"
          color={theme.colors[theme.primaryColor][7]}
        >
          {Array.from(m.first_name)[0]}
          {Array.from(m.last_name)[0]}
        </Avatar>
        <Stack gap={1}>
          <Text fz="sm" fw={600}>
            {m.first_name} {m.last_name}
          </Text>
          <Text lineClamp={2} fz="xs" c="dimmed">
            {m.message}
          </Text>
        </Stack>
      </Flex>
    </Menu.Item>
  ));

  const notifications = NOTIFICATIONS.slice(0, 3).map((n) => (
    <Menu.Item
      key={n.id}
      style={{
        borderBottom: `1px solid ${
          colorScheme === 'dark' ? theme.colors.gray[7] : theme.colors.gray[3]
        }`,
      }}
    >
      <Flex gap="sm" align="center">
        <Avatar src={n.icon} alt={n.title} variant="filled" size="sm" />
        <Stack gap={1}>
          <Text fz="sm" fw={600}>
            {n.title}
          </Text>
          <Text lineClamp={2} fz="xs" c="dimmed">
            {n.message}
          </Text>
        </Stack>
      </Flex>
    </Menu.Item>
  ));

  return (
    <Group justify="space-between" flex={1} wrap="nowrap">
      {/* Left Section: Sidebar Toggle */}
      <Group gap={0} style={{ flex: '0 0 auto' }}>
        <Tooltip label={getSidebarToggleTooltip()}>
          <ActionIcon
            onClick={handleSidebarToggle}
            variant={headerVariant === 'colored' ? 'transparent' : 'default'}
            size="lg"
          >
            {getSidebarToggleIcon()}
          </ActionIcon>
        </Tooltip>
      </Group>

      

      {/* Right Section: Actions & User Menu */}
      <Group style={{ flex: '0 0 auto' }}>
        {mobile_match && (
          <ActionIcon
            variant={headerVariant === 'colored' ? 'transparent' : 'default'}
          >
            <IconSearch size={ICON_SIZE} color={textColor} />
          </ActionIcon>
        )}
       
       
        <Menu shadow="lg" width={320}>
          <Menu.Target>
            <Indicator processing size={10} offset={6}>
              <Tooltip label="Notifications">
                <ActionIcon
                  size="lg"
                  title="Notifications"
                  variant={
                    headerVariant === 'colored' ? 'transparent' : 'default'
                  }
                >
                  <IconBell size={ICON_SIZE} color={textColor} />
                </ActionIcon>
              </Tooltip>
            </Indicator>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label tt="uppercase" ta="center" fw={600}>
              {NOTIFICATIONS.length} new notifications
            </Menu.Label>
            {notifications}
            <Menu.Item tt="uppercase" ta="center" fw={600}>
              Show all notifications
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        
        <Menu shadow="lg" width={280}>
          <Menu.Target>
            <Tooltip label="Account">
              <ActionIcon
                size="lg"
                variant={
                  headerVariant === 'colored' ? 'transparent' : 'default'
                }
                style={{ borderRadius: '50%' }}
              >
                <Avatar
                  src={user?.image ?? null}
                  alt={user?.name ?? ''}
                  size="sm"
                />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  {user?.name ?? '—'}
                </Text>
                <Text size="xs">{user?.email ?? '—'}</Text>
              </Stack>
            </Menu.Label>
            <Menu.Divider />
            <Menu.Item leftSection={<IconUser size={16} />}>Profile</Menu.Item>
            <Menu.Item 
              leftSection={<IconSettings size={16} />}
              onClick={() => router.push('/operador/configuracion')}
            >
              Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconPower size={16} />}
              color="red"
              onClick={() => router.push('/')}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};

export default HeaderNav;

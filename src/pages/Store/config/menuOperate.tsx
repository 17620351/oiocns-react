import EntityIcon from '@/bizcomponents/GlobalComps/entityIcon';
import orgCtrl from '@/ts/controller';
import { IDirectory, IGroup, ITarget } from '@/ts/core';
import React from 'react';
import { MenuItemType } from 'typings/globelType';
import { loadFileMenus } from '@/executor/fileOperate';

/** 创建团队菜单 */
const createMenu = (team: ITarget, children: MenuItemType[]) => {
  return {
    key: team.key,
    item: team.directory,
    label: team.name,
    itemType: team.directory.typeName,
    menus: loadFileMenus(team.directory, 1),
    tag: [team.typeName],
    icon: <EntityIcon notAvatar={true} entityId={team.id} size={18} />,
    children: children,
    beforeLoad: async () => {
      if ('directory' in team) {
        await (team as ITarget).directory.loadContent();
      }
    },
  };
};
/** 编译组织集群树 */
const buildGroupTree = (groups: IGroup[]): MenuItemType[] => {
  return groups.map((item) =>
    createMenu(item, [
      ...buildDirectoryTree(item.directory.children),
      ...buildGroupTree(item.children),
    ]),
  );
};

/** 编译目录树 */
const buildDirectoryTree = (directorys: IDirectory[]): MenuItemType[] => {
  return directorys.map((directory) => {
    return {
      key: directory.key,
      item: directory,
      label: directory.name,
      tag: [directory.typeName],
      icon: (
        <EntityIcon entityId={directory.id} typeName={directory.typeName} size={18} />
      ),
      itemType: directory.typeName,
      menus: loadFileMenus(directory, 2),
      children: buildDirectoryTree(directory.children),
      beforeLoad: async () => {
        await directory.loadContent();
      },
    };
  });
};

/** 获取个人菜单 */
const getUserMenu = () => {
  return createMenu(orgCtrl.user, [
    ...buildDirectoryTree(orgCtrl.user.directory.children),
    ...orgCtrl.user.cohorts.map((i) =>
      createMenu(i, buildDirectoryTree(i.directory.children)),
    ),
  ]);
};

/** 获取组织菜单 */
const getTeamMenu = () => {
  const children: MenuItemType[] = [];
  for (const company of orgCtrl.user.companys) {
    children.push(
      createMenu(company, [
        ...buildDirectoryTree(company.directory.children),
        ...company.targets
          .filter((i) => i.isMyChat && i.id != company.id)
          .map((i) => createMenu(i, buildDirectoryTree(i.directory.children))),
        ...buildGroupTree(company.groups),
      ]),
    );
  }
  return children;
};

/** 加载设置模块菜单 */
export const loadStoreMenu = () => {
  return {
    key: '存储',
    label: '存储',
    itemType: 'group',
    children: [getUserMenu(), ...getTeamMenu()],
    icon: <EntityIcon notAvatar={true} entityId={orgCtrl.user.id} size={18} />,
  };
};

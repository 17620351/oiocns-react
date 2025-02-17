import React, { useEffect, useState } from 'react';
import { Avatar, Image } from 'antd';
import orgCtrl from '@/ts/controller';
import { ShareIcon } from '@/ts/base/model';
import { parseAvatar } from '@/ts/base';
import TypeIcon from './typeIcon';

interface teamTypeInfo {
  preview?: boolean;
  size?: number;
  entityId: string;
  typeName?: string;
  notAvatar?: boolean;
  title?: string;
  showName?: boolean;
}

/** 组织图标 */
const EntityIcon = (info: teamTypeInfo) => {
  const [preview, setPreview] = useState(false);
  const [share, setShare] = useState<ShareIcon>();
  const size = info.size ?? 22;
  useEffect(() => {
    if (info.entityId && info.entityId.length > 10) {
      orgCtrl.user.findEntityAsync(info.entityId).then((value) => {
        if (value) {
          setShare({
            name: value.name,
            typeName: value.typeName,
            avatar: parseAvatar(value.icon),
          });
        }
      });
    }
  }, []);
  if (share?.avatar && share?.avatar.thumbnail) {
    return (
      <div
        style={{ cursor: 'pointer', display: 'contents' }}
        title={info.title ?? '点击预览'}>
        {info.preview && (
          <Image
            style={{ display: 'none' }}
            preview={{
              visible: preview,
              src: share.avatar.shareLink,
              onVisibleChange: (value) => {
                setPreview(value);
              },
            }}
          />
        )}
        <Avatar
          size={size}
          src={share.avatar.thumbnail}
          onClick={() => {
            setPreview(true);
          }}
        />
        {info.showName && <b style={{ marginLeft: 6 }}>{share.name}</b>}
      </div>
    );
  }
  const icon = (
    <TypeIcon avatar iconType={info.typeName || share?.typeName || '其它'} size={size} />
  );
  if (info.notAvatar) {
    return icon;
  }
  return (
    <div style={{ display: 'contents' }}>
      <Avatar
        size={size}
        icon={icon}
        style={{ background: 'transparent', color: '#606060' }}
      />
      {info.showName && <b style={{ marginLeft: 6 }}>{share?.name}</b>}
    </div>
  );
};

export default EntityIcon;

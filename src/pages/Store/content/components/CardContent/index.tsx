import { Dropdown, Row, Col, Card, Typography } from 'antd';

import React from 'react';
import cls from '../../index.module.less';
import { IDirectory, IFileInfo } from '@/ts/core';
import { command, schema } from '@/ts/base';
import EntityIcon from '@/bizcomponents/GlobalComps/entityIcon';
import { loadFileMenus } from '@/executor/fileOperate';

const CardListContent = ({ current }: { current: IDirectory }) => {
  const FileCard = (el: IFileInfo<schema.XEntity>) => (
    <Dropdown
      menu={{
        items: loadFileMenus(el, 1),
        onClick: ({ key }) => {
          command.emitter('data', key, el);
        },
      }}
      trigger={['contextMenu']}>
      <Card
        size="small"
        hoverable
        bordered={false}
        key={el.key}
        onDoubleClick={async () => {
          await el.loadContent();
          command.emitter('data', 'open', el);
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
        }}>
        <div className={cls.fileImage}>
          <EntityIcon entityId={el.id} size={50} />
        </div>
        <div className={cls.fileName} title={el.typeName}>
          <Typography.Text title={el.typeName} ellipsis>
            {el.typeName}
          </Typography.Text>
        </div>
        <div className={cls.fileName} title={el.name}>
          <Typography.Text title={el.name} ellipsis>
            {el.name}
          </Typography.Text>
        </div>
      </Card>
    </Dropdown>
  );
  return (
    <Dropdown
      menu={{
        items: loadFileMenus(current, 1),
        onClick: ({ key }) => {
          command.emitter('data', key, current);
        },
      }}
      trigger={['contextMenu']}>
      <div
        className={cls.content}
        onContextMenu={(e) => {
          e.stopPropagation();
        }}>
        <Row gutter={[16, 16]}>
          {current.content(1).map((el) => {
            return (
              <Col xs={8} sm={8} md={6} lg={4} xl={3} xxl={2} key={el.key}>
                {FileCard(el)}
              </Col>
            );
          })}
        </Row>
      </div>
    </Dropdown>
  );
};
export default CardListContent;

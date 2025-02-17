import React, { useEffect, useState } from 'react';
import InsertButton from '../InsertButton';
import { AiOutlineCopy, AiOutlineClose } from 'react-icons/ai';
import cls from './index.module.less';
import SelectOrg from '../selectOrg';
import { IWork } from '@/ts/core';
import { dataType } from '@/bizcomponents/FlowDesign/processType';

type DeptWayNodeProps = {
  onInsertNode: Function;
  onDelNode: Function;
  onCopy: Function;
  onSelected: Function;
  config: any;
  level: any;
  define?: IWork;
  isEdit: boolean;
};

/**
 * 部门网关节点
 * @returns
 */
const DeptWayNode: React.FC<DeptWayNodeProps> = (props: DeptWayNodeProps) => {
  const [key, setKey] = useState<number>(0);
  const [orgId, setOrgId] = useState<string>();
  const delNode = () => {
    props.onDelNode();
  };
  const copy = () => {
    props.onCopy();
  };
  const select = () => {
    props.onSelected();
  };

  useEffect(() => {
    if (props.isEdit && props.define) {
      if (props.config.conditions.length == 0) {
        props.config.conditions = [
          {
            pos: 1,
            paramKey: '0',
            paramLabel: '组织',
            key: 'EQ',
            label: '=',
            type: dataType.BELONG,
            val: props.define.application?.directory.target.id,
            display: props.define.application?.directory.target.name,
          },
        ];
        setKey(key + 1);
      }
      setOrgId(props.define.metadata.shareId);
    }
  }, []);

  const nodeHeader = (
    <div className={cls['node-body-main-header']}>
      <span className={cls['title']}>
        <i className={cls['el-icon-s-operation']}></i>
        <span className={cls['name']}>
          {props.config.name ? props.config.name : '组织分支' + props.level}
        </span>
      </span>
      {props.isEdit && !props.config.readonly && (
        <span className={cls['option']}>
          <AiOutlineCopy
            style={{ fontSize: '15px', marginRight: '50px' }}
            onClick={copy}
          />
          <AiOutlineClose
            style={{ fontSize: '15px', marginRight: '10px' }}
            onClick={delNode}
          />
        </span>
      )}
    </div>
  );

  const onChange = (newValue: string, labels: string[]) => {
    props.config.conditions[0].display = labels[0];
    props.config.conditions[0].val = newValue;
    setKey(key + 1);
  };

  const nodeContent = (
    <div className={cls['node-body-main-content']} onClick={select}>
      {/* <span>组织分支</span> */}
      <span>
        {props.isEdit && props.define ? (
          <SelectOrg
            key={key}
            onChange={onChange}
            orgId={orgId}
            target={props.define.application!.directory.target}
            value={props.config.conditions[0]?.val}
            rootDisable={false}
          />
        ) : (
          props.config.conditions[0].display
        )}
      </span>
    </div>
  );

  return (
    <div className={props.isEdit ? cls['node'] : cls['node-unEdit']}>
      <div className={cls['node-body']}>
        <div className={cls['node-body-main']}>
          {nodeHeader}
          {nodeContent}
        </div>
      </div>
      <div className={cls['node-footer']}>
        {props.isEdit && (
          <div className={cls['btn']}>
            <InsertButton onInsertNode={props.onInsertNode} />
          </div>
        )}
      </div>
    </div>
  );
};

DeptWayNode.defaultProps = {
  config: {},
  level: 1,
};

export default DeptWayNode;

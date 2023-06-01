import React, { useEffect, useState } from 'react';
import { ParamsType, ProTableProps } from '@ant-design/pro-components';
import BaseThing from '../BaseThing';
import { XProperty } from '@/ts/base/schema';
import cls from './index.module.less';
import CustomTree from '@/components/CustomTree';
import { buildThingTree } from './treequest';
interface PageProp {
  selectable?: boolean;
  selectedKeys?: string[];
  onRowSelectChange?: (
    selectedRowKeys: React.Key[],
    selectedRows: { [key: string]: any }[],
  ) => void;
  propertys: XProperty[];
  labels: any;
  current: any;
  belongId: any;
}

const SelectThing = <
  DataType extends Record<string, any>,
  Params extends ParamsType = ParamsType,
  ValueType = 'text',
>(
  props: ProTableProps<DataType, Params, ValueType> & PageProp,
) => {
  const {
    // pageType = 'tree',
    selectable = false,
    onRowSelectChange,
    selectedKeys = [],
    current,
    // belongId,
    propertys,
    ...rest
  } = props;
  const [treeData, setTreeData] = useState<any[]>([]);
  const [treeSelected, setTreeSelected] = useState<any>({});
  useEffect(() => {
    queryData();
  }, [current]);
  async function queryData() {
    setTreeData(await buildThingTree(current.workItem.current.species));
  }

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      onRowSelectChange && onRowSelectChange(selectedRowKeys, selectedRows);
    },
    selectedRowKeys: selectedKeys,
    // getCheckboxProps: (record: DataType) => ({
    //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
    //   name: record.name,
    // }),
  };

  const handleSelect: any = (
    selectedKeys: string[],
    _info: {
      event: 'select';
      selected: boolean;
      node: any;
      selectedNodes: any[];
      nativeEvent: MouseEvent;
    },
  ) => {
    setTreeSelected(_info.node.item);
    console.log('选择实体', selectedKeys, _info.node.item);
  };
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div className={cls.leftTree}>
        <CustomTree
          title={'实体仓库'}
          showIcon
          treeData={treeData}
          fieldNames={{ title: 'label', key: 'key', children: 'children' }}
          onSelect={handleSelect}
        />
      </div>
      <BaseThing
        rowSelection={selectable ? rowSelection : undefined}
        key={treeSelected?.id}
        propertys={propertys}
        colKey={'propertyId'}
        readonly
        {...rest}
        labels={treeSelected?.id ? [`S${treeSelected.id}`] : undefined}
      />
    </div>
  );
};

export default SelectThing;

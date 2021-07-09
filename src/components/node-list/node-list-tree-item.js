import React from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import NodeListRow from './node-list-row';

const NodeListTreeItem = ({
  data,
  onItemClick,
  onItemMouseEnter,
  onItemMouseLeave,
  onItemChange,
  children,
  searchCount,
  focusMode,
  parentDisabled,
  parentPipeline,
}) => (
  <TreeItem
    key={data.id}
    nodeId={data.id}
    collapseIcon={<ExpandMoreIcon />}
    expandIcon={<ChevronRightIcon />}
    label={
      <NodeListRow
        container="div"
        key={data.id}
        id={data.id}
        kind="element"
        label={data.highlightedLabel || data.name}
        name={data.name}
        icon={data.icon}
        type={data.type}
        active={data.active}
        checked={data.checked}
        disabled={data.disabled}
        faded={data.faded}
        visible={data.visible}
        selected={data.selected}
        allUnchecked={true}
        visibleIcon={data.visibleIcon}
        invisibleIcon={data.invisibleIcon}
        onClick={() => onItemClick(data)}
        onMouseEnter={() => onItemMouseEnter(data)}
        onMouseLeave={() => onItemMouseLeave(data)}
        onChange={(e) => onItemChange(data, !e.target.checked)}
        rowType="tree"
        searchCount={searchCount}
        focusMode={focusMode}
        parentDisabled={parentDisabled}
        parentPipeline={parentPipeline}
      />
    }>
    {children}
  </TreeItem>
);

export default NodeListTreeItem;
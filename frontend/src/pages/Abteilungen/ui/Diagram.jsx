import clsx from "clsx";
import s from "./Diagram.module.scss";

const Node = ({ node, onDepartmentClick, current }) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={s.nodeWrapper}>
      <div
        className={clsx(s.nodeBox, {
          [s.current]: current === node.navLabel,
        })}
        onClick={() => onDepartmentClick(node.navLabel)}
      >
        <div>{node.navLabel}</div>
      </div>

      {hasChildren && (
        <div className={s.children}>
          {node.children.map((child) => (
            <div key={child.navLabel} className={s.child}>
              <div className={s.connectorVertical} />
              <Node
                node={child}
                current={current}
                onDepartmentClick={onDepartmentClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Diagram = ({ tree, onDepartmentClick, selectedDivision }) => {
  const handleDepartmentClick = (navLabel) => {
    onDepartmentClick(navLabel);
  };

  return (
    <div className={s.diagram}>
      {tree.map((node) => (
        <Node
          key={node.navLabel}
          node={node}
          onDepartmentClick={handleDepartmentClick}
          current={selectedDivision}
        />
      ))}
    </div>
  );
};

export default Diagram;

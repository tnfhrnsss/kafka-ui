import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { Tag } from 'components/common/Tag/Tag.styled';
import { Topic } from 'generated-sources';
import { NavLink } from 'react-router-dom';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterName } from 'lib/interfaces/cluster';

export const TopicTitleCell: React.FC<CellContext<Topic, unknown>> = ({
  row: { original },
}) => {
  const { internal, name } = original;
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const handleClick = React.useCallback(() => {
    try {
      // Keep legacy last visited for any other consumers
      localStorage.setItem(`lastVisitedTopic:${clusterName}`, name);
      // Maintain recent list used by Search suggestions
      const key = `recentTopicSearches:${clusterName}`;
      const raw = localStorage.getItem(key);
      const prev = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [name, ...prev.filter((s) => s !== name)].slice(0, 5);
      localStorage.setItem(key, JSON.stringify(next));
    } catch (e) {
      // do nothing
    }
  }, [clusterName, name]);
  return (
    <NavLink
      to={name}
      title={name}
      style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
      onClick={handleClick}
    >
      {internal && (
        <Tag color="gray" style={{ marginRight: '0.75em' }}>
          IN
        </Tag>
      )}
      {name}
    </NavLink>
  );
};

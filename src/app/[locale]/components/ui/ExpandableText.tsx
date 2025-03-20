import { useState } from 'react';

type Props = {
  text: string;
  maxLength: number;
  initialParentHeight: number;
}

const ExpandableText = ({ text, maxLength = 100, initialParentHeight }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= maxLength) return <p>{text}</p>;

  return (
    <div style={{ maxHeight: `${initialParentHeight}px` }} className="flex flex-col">
      {isExpanded ? (
        <div className="overflow-y-auto">
          <p className="text-sm mr-4">{text}</p>
        </div>
      ) : (
        <p className="text-sm text-ellipsis overflow-hidden">
          {`${text.slice(0, maxLength)}...`}
        </p>
      )}
      <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-500 mt-2">
        {isExpanded ? 'Less' : 'More'}
      </button>
    </div>
  );
};

export default ExpandableText;
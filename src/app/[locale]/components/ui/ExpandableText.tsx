import { useState } from 'react';

type Props = {
  text: string;
  maxLength: number;
  initialParentHeight: number;
}

const ExpandableText = ({ text, maxLength = 100, initialParentHeight }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updatedText = text.replace(/\u00A0/g, ' ');

  if (updatedText.length <= maxLength) return <p>{updatedText}</p>;

  return (
    <div style={{ maxHeight: `${initialParentHeight}px` }} className="flex flex-col">
      {isExpanded ? (
        <div className='overflow-y-auto'>
          <p className="text-sm mr-4 hyphens-auto text-pretty text-justify" style={{ hyphenateLimitChars: 7 }}>{updatedText}</p>
        </div>
      ) : (
        <p className="text-sm text-ellipsis hyphens-auto text-pretty text-justify overflow-hidden" style={{ hyphenateLimitChars: 7 }}>
          {`${updatedText.slice(0, maxLength)}...`}
        </p>
      )}
      <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-500 mt-2">
        {isExpanded ? 'Less' : 'More'}
      </button>
    </div>
  );
};

export default ExpandableText;
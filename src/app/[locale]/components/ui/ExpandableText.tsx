import { useState } from 'react';

type Props = {
    text: string;
    maxLength: number;
}

const ExpandableText = ({ text, maxLength = 100 }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= maxLength) return <p>{text}</p>;

  return (
    <p className='text-sm'>
      {isExpanded ? text : `${text.slice(0, maxLength)}... `}
      <br />
      <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-500">
        {isExpanded ? 'Less' : 'More'}
      </button>
    </p>
  );
};

export default ExpandableText;
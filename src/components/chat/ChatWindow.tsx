import MessageBubble from './MessageBubble';

const groups = [
  {
    date: 'Monday, October 6 2025',
    messages: [
      {
        id: '1',
        content: 'This message has been deleted',
        time: '03:51 PM',
        isOwn: true,
        deleted: true,
      },
    ],
  },
  {
    date: 'Today',
    messages: [
      {
        id: '2',
        content: 'This message has been deleted',
        time: '10:25 PM',
        isOwn: true,
        deleted: true,
      },
    ],
  },
];

export default function ChatWindow() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-50">
      {groups.map((group) => (
        <div key={group.date} className="space-y-3">
          {/* Date divider */}
          <div className="flex items-center justify-center">
            <span className="text-xs text-gray-400 bg-gray-50 px-3">
              {group.date}
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {group.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                time={msg.time}
                isOwn={msg.isOwn}
                deleted={msg.deleted}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TxnCard({
  title,
  amount,
  color,
  icon,
}: {
  title: string;
  amount: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray to-black rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-lg font-bold `}>{title}</h3>
        {icon && <div className="ml-2">{icon}</div>}
      </div>
      <p className={`text-xl font-bold ${color}`}>{amount}</p>
    </div>
  );
}

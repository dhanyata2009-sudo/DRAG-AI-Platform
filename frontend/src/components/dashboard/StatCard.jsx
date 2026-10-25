import Card from "../common/Card";

const StatCard = ({ label, value, delta }) => (
  <Card className="p-5">
    <p className="text-xs font-mono text-faint tracking-wide uppercase">{label}</p>
    <p className="font-display text-3xl font-semibold text-body mt-2">{value}</p>
    <p className="text-xs text-cyan-400 mt-1.5">{delta}</p>
  </Card>
);

export default StatCard;

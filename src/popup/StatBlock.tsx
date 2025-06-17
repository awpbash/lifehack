import React from "react";
import styles from "./StatBlock.module.css";

interface StatBlockProps {
  icon: string;
  label: string;
  score: number;
}

const StatBlock: React.FC<StatBlockProps> = ({ icon, label, score }) => {
  return (
    <div className={styles.statBlock}>
      <div className={styles.statContent}>
        <img src={icon} alt={label} className={styles.icon} />
        <div className={styles.label}>{label}</div>
        <div className={styles.score}>{score}/5</div>
      </div>
    </div>
  );
};

export default StatBlock;
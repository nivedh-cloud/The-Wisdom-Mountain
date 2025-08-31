import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const data = [
  { king: 'Saul', king_te: 'సౌలు', years: 40, good: false, prophet: 'Samuel', prophet_te: 'శమూయేలు' },
  { king: 'David', king_te: 'దావీదు', years: 40, good: true, prophet: 'Nathan', prophet_te: 'నాతాన్' },
  { king: 'Solomon', king_te: 'సొలొమోను', years: 40, good: true, prophet: 'Ahijah', prophet_te: 'అహీయా' },
  { king: 'Rehoboam', king_te: 'రెహబోయాము', years: 17, good: false, prophet: 'Shemaiah', prophet_te: 'శెమయా' },
  { king: 'Abijah', king_te: 'అబీయా', years: 3, good: false, prophet: 'Iddo', prophet_te: 'ఇద్దో' },
  { king: 'Asa', king_te: 'ఆసా', years: 41, good: true, prophet: 'Azariah', prophet_te: 'అజర్యా' },
  { king: 'Jehoshaphat', king_te: 'యెహోషాపాటు', years: 25, good: true, prophet: 'Jehu', prophet_te: 'యేహూ' },
  { king: 'Jehu', king_te: 'యేహూ', years: 28, good: false, prophet: 'Elisha', prophet_te: 'ఎలీషా' },
  { king: 'Hezekiah', king_te: 'హిజ్కీయా', years: 29, good: true, prophet: 'Isaiah', prophet_te: 'యెషయా' },
  { king: 'Josiah', king_te: 'యోషీయా', years: 31, good: true, prophet: 'Jeremiah', prophet_te: 'యిర్మియా' }
];

const translations = {
  en: {
    title: 'Israel Kings Genealogy',
    king: 'King',
    years: 'Years',
    good: 'Good?',
    prophet: 'Prophet',
    yes: 'Yes',
    no: 'No',
    chartLabel: 'Years of Reign'
  },
  te: {
    title: 'ఇస్రాయేల్ రాజుల వంశావళి',
    king: 'రాజు',
    years: 'ఏళ్లు',
    good: 'మంచివాడా?',
    prophet: 'ప్రవక్త',
    yes: 'అవును',
    no: 'కాదు',
    chartLabel: 'పాలన సంవత్సరాలు'
  }
};

export default function IsraelKingsGenealogy({ lang }) {
  const t = translations[lang] || translations.en;
  return (
    <div>
      <h2 style={{ color: '#6366f1', fontSize: '2em', marginBottom: '0.5em', letterSpacing: 1 }}>{t.title}</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f0fdfa', borderRadius: 10, boxShadow: '0 2px 8px rgba(52,211,153,0.08)' }}>
          <thead>
            <tr>
              <th>{t.king}</th>
              <th>{t.years}</th>
              <th>{t.good}</th>
              <th>{t.prophet}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#e0e7ff' : undefined }}>
                <td>{lang === 'te' ? row.king_te : row.king}</td>
                <td>{row.years}</td>
                <td>{row.good ? t.yes : t.no}</td>
                <td>{lang === 'te' ? row.prophet_te : row.prophet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '2em', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(99,102,241,0.10)', padding: 16 }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
            <XAxis dataKey={lang === 'te' ? 'king_te' : 'king'} angle={-30} textAnchor="end" interval={0} height={70} />
            <YAxis label={{ value: t.chartLabel, angle: -90, position: 'insideLeft', fill: '#6366f1', fontWeight: 'bold' }} />
            <Tooltip formatter={(value, name) => [value, t.years]} labelFormatter={label => `${t.king}: ${label}`} />
            <Bar dataKey="years" fill="#fbbf24">
              <LabelList dataKey="years" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

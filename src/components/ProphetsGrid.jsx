import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const columns = (language) => [
  {
    field: 'id',
    headerName: 'ID',
    width: 90,
  },
  {
    field: 'name',
    headerName: language === 'te' ? 'పేరు' : 'Name',
    width: 150,
  },
  {
    field: 'period',
    headerName: language === 'te' ? 'కాలం' : 'Period',
    width: 150,
  },
  {
    field: 'ministry',
    headerName: language === 'te' ? 'సేవ' : 'Ministry',
    width: 150,
  },
  {
    field: 'category',
    headerName: language === 'te' ? 'రకం' : 'Type',
    width: 180,
  },
  {
    field: 'booksWritten',
    headerName: language === 'te' ? 'వ్రాసిన పుస్తకాలు' : 'Books Written',
    width: 200,
  },
  {
    field: 'details',
    headerName: language === 'te' ? 'వివరాలు' : 'Details',
    width: 300,
  },
];

const rows = [
  { id: 1, name: 'మోషే', period: '1526-1406 BC', ministry: '40 years in wilderness', category: 'Major Prophet/Lawgiver', booksWritten: 'Genesis, Exodus, Leviticus, Numbers, Deuteronomy', details: 'Prophesied about the coming of the Messiah' },
  { id: 2, name: 'సమూయేలు', period: '1105-1020 BC', ministry: '60+ years', category: 'Major Prophet/Judge', booksWritten: '1 Samuel (partial), 2 Samuel (partial)', details: 'Last judge and first prophet of Israel' },
  { id: 3, name: 'నాతాను', period: '1040-970 BC', ministry: '40+ years', category: 'Court Prophet', booksWritten: 'None', details: 'Court prophet to King David' },
  { id: 4, name: 'ఏలీయా', period: '875-848 BC', ministry: '25+ years', category: 'Major Prophet', booksWritten: 'None', details: 'Fiery prophet who confronted Baal worship' },
  { id: 5, name: 'ఎలీషా', period: '848-797 BC', ministry: '50+ years', category: 'Major Prophet', booksWritten: 'None', details: 'Successor to Elijah with double portion' },
  { id: 6, name: 'యెషయా', period: '740-681 BC', ministry: '60+ years', category: 'Major Prophet', booksWritten: 'Isaiah', details: 'Greatest Messianic prophet' },
  { id: 7, name: 'యిర్మీయా', period: '627-586 BC', ministry: '40+ years', category: 'Major Prophet', booksWritten: 'Jeremiah, Lamentations', details: 'Weeping prophet of Judah exile' },
  { id: 8, name: 'యెహెజ్కేలు', period: '593-571 BC', ministry: '22+ years', category: 'Major Prophet', booksWritten: 'Ezekiel', details: 'Prophet of exile and restoration' },
  { id: 9, name: 'దానియేలు', period: '605-535 BC', ministry: '70+ years', category: 'Major Prophet', booksWritten: 'Daniel', details: 'Prophet in Babylonian court' },
];

export default function ProphetsGrid({ language }) {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns(language)}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
    </div>
  );
}
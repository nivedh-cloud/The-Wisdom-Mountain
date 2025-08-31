import GenealogyGrid from '../screens/GenealogyTest';
import KingsGrid from '../screens/KingsGrid';
import JudgesGrid from '../screens/JudgesGrid';
import ProphetsGrid from '../screens/ProphetsGrid';
import MapsGrid from '../screens/MapsGrid';
import KeyErasGrid from '../screens/KeyErasGrid';
import D3Chart from '../screens/D3Chart';

const GridComponent = ({ lang, page }) => {
  if ([
    'adam-to-jesus','adam-to-noah','noah-to-abraham','abraham-to-moses','moses-to-david','david-to-hezekiah','before-babylonian-exile','after-babylonian-exile'
  ].includes(page)) {
    // Temporarily use D3Chart for Adam to Jesus to test Telugu display
    if (page === 'adam-to-jesus') {
      return <div className="grid-container"><D3Chart key={lang} lang={lang} /></div>;
    }
    return <div className="grid-container"><GenealogyGrid lang={lang} section={page} /></div>;
  }
  if (page === 'judah-kings') {
    return <div className="grid-container"><KingsGrid lang={lang} section="judah-kings" /></div>;
  }
  if (page === 'israel-kings') {
    return <div className="grid-container"><KingsGrid lang={lang} section="israel-kings" /></div>;
  }
  if (page === 'list-of-judges') {
    return <div className="grid-container"><JudgesGrid lang={lang} section="list-of-judges" /></div>;
  }
  if (page === 'list-of-prophets') {
    return <div className="grid-container"><ProphetsGrid lang={lang} section="list-of-prophets" /></div>;
  }
  if (['old-testament-maps', 'new-testament-maps'].includes(page)) {
    return <div className="grid-container"><MapsGrid lang={lang} section={page} /></div>;
  }
  if (['wilderness-wanderings', 'the-exile', 'judges-period', 'united-kingdom', 'divided-kingdom', 'return-from-exile'].includes(page)) {
    return <div className="grid-container"><KeyErasGrid lang={lang} section={page} /></div>;
  }
  if (page === 'd3-chart') {
    return <div className="grid-container"><D3Chart lang={lang} /></div>;
  }
  return null;
};
export default GridComponent;

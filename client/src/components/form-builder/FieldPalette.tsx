import { Icon } from '../../Icons';
import { FieldTemplate } from '../../types';
import { FIELD_TEMPLATES } from '../../fieldTemplates';

interface FieldPaletteProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  onAddField: (template: FieldTemplate) => void;
  onDragStart: (template: FieldTemplate) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'text', label: 'Text' },
  { id: 'choice', label: 'Choices' },
  { id: 'datetime', label: 'Date/Time' },
  { id: 'special', label: 'Special' },
];

/**
 * Left sidebar field template palette.
 * Allows searching, filtering, clicking, and dragging field templates.
 */
export function FieldPalette({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  onAddField,
  onDragStart,
}: FieldPaletteProps) {
  const filteredTemplates = FIELD_TEMPLATES.filter((t) => {
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <aside className="sidebar-palette">
      <div className="sidebar-header">
        <h3>Field Elements</h3>
        <p>Drag or click any field to add to canvas.</p>
      </div>

      <div className="sidebar-search">
        <input
          type="search"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="category-chips">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip ${categoryFilter === c.id ? 'active' : ''}`}
            onClick={() => setCategoryFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="templates-list">
        {filteredTemplates.map((template) => (
          <div
            key={template.type}
            className="template-card"
            draggable
            onDragStart={() => onDragStart(template)}
            onClick={() => onAddField(template)}
            title="Click or drag into form canvas"
          >
            <div className="template-icon-box">
              <Icon name={template.icon} size={18} />
            </div>
            <div className="template-info">
              <span className="template-name">{template.name}</span>
              <span className="template-desc">{template.description}</span>
            </div>
            <span className="add-badge">+ Add</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

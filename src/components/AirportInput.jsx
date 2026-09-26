import { useEffect, useState } from 'react';
import { AIRPORT, airportLabel, searchAirports } from '../lib/data.js';

/** Accessible autocomplete combobox. The value is an IATA code or ''. */
export default function AirportInput({ id, label, value, onChange, error, placeholder }) {
  const [text, setText] = useState(value ? airportLabel(value) : '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const matches = open ? searchAirports(text) : [];
  const listId = `${id}-listbox`;

  useEffect(() => {
    setText(value ? airportLabel(value) : '');
  }, [value]);

  function choose(code) {
    onChange(code);
    setText(airportLabel(code));
    setOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(matches.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && open && matches[active]) {
      e.preventDefault();
      choose(matches[active].code);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function onBlur() {
    setTimeout(() => {
      setOpen(false);
      const code = text.trim().toUpperCase();
      if (!value && AIRPORT[code]) choose(code);
    }, 120);
  }

  return (
    <div className="field combo">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open && matches.length > 0}
        aria-controls={listId}
        aria-activedescendant={open && matches[active] ? `${id}-opt-${matches[active].code}` : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder={placeholder || 'City or airport'}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(0);
          if (value) onChange('');
        }}
        onFocus={(e) => {
          e.target.select();
          if (text && !value) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
      {open && matches.length > 0 && (
        <ul className="combo-list" role="listbox" id={listId} aria-label={`${label} suggestions`}>
          {matches.map((a, i) => (
            <li
              key={a.code}
              id={`${id}-opt-${a.code}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(a.code);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="combo-code">{a.code}</span>
              <span>
                <span className="combo-city">{a.city}</span>
                <span className="combo-name">{a.name}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

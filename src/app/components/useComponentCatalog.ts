import { useCallback, useEffect, useMemo, useState } from 'react';
import { COMPONENT_DEFS, type ComponentDef } from '../shared';

const CUSTOM_COMPONENTS_KEY = 'custom-dashboard-components';
const CATALOG_CHANGE_EVENT = 'custom-dashboard-components-change';

function loadStoredComponents(): ComponentDef[] {
  try {
    const raw = window.localStorage.getItem(CUSTOM_COMPONENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistComponents(components: ComponentDef[]) {
  window.localStorage.setItem(CUSTOM_COMPONENTS_KEY, JSON.stringify(components));
  window.dispatchEvent(new CustomEvent(CATALOG_CHANGE_EVENT, { detail: components }));
}

export function useComponentCatalog() {
  const [storedComponents, setStoredComponents] = useState<ComponentDef[]>(loadStoredComponents);

  useEffect(() => {
    const sync = (event: Event) => {
      const customEvent = event as CustomEvent<ComponentDef[]>;
      setStoredComponents(customEvent.detail ?? loadStoredComponents());
    };
    const syncStorage = () => setStoredComponents(loadStoredComponents());
    window.addEventListener(CATALOG_CHANGE_EVENT, sync);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener(CATALOG_CHANGE_EVENT, sync);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  const components = useMemo(() => {
    const overrides = new Map(storedComponents.filter(item => !item.isCustom).map(item => [item.id, item]));
    const systemComponents = COMPONENT_DEFS.map(item => {
      const override = overrides.get(item.id);
      return override ? { ...item, tags: override.tags } : item;
    });
    const customComponents = storedComponents.filter(item => item.isCustom);
    return [...systemComponents, ...customComponents];
  }, [storedComponents]);

  const saveComponent = useCallback((component: ComponentDef) => {
    setStoredComponents(previous => {
      const next = previous.some(item => item.id === component.id)
        ? previous.map(item => item.id === component.id ? component : item)
        : [...previous, component];
      persistComponents(next);
      return next;
    });
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setStoredComponents(previous => {
      const next = previous.filter(item => item.id !== id);
      persistComponents(next);
      return next;
    });
  }, []);

  return { components, saveComponent, deleteComponent };
}

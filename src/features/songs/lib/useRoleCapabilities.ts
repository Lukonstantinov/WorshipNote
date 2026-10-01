import { useMemo } from 'react'
import { useSettingsStore } from '../../../store/settingsStore'

export interface RoleCapabilities {
  showChords: boolean
  showCues: boolean
  showDiagrams: boolean
}

export const BUILT_IN_ROLE_CAPABILITIES: Record<string, RoleCapabilities> = {
  musician: { showChords: true, showCues: true, showDiagrams: true },
  singer: { showChords: true, showCues: false, showDiagrams: false },
  congregation: { showChords: false, showCues: false, showDiagrams: false },
}

/** What the currently selected role is allowed to see. */
export function useRoleCapabilities(): RoleCapabilities {
  const role = useSettingsStore((s) => s.role)
  const customRoles = useSettingsStore((s) => s.customRoles)
  return useMemo(() => {
    const customRole = customRoles.find((cr) => cr.id === role)
    if (customRole) {
      return { showChords: customRole.showChords, showCues: customRole.showCues, showDiagrams: customRole.showDiagrams }
    }
    return BUILT_IN_ROLE_CAPABILITIES[role as string] ?? BUILT_IN_ROLE_CAPABILITIES.musician
  }, [role, customRoles])
}

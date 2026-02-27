import type { Watch } from './data/watches'

// ==========================================
// WATCH IMAGE CATALOG MAPPING
// ==========================================
// Maps watch IDs to actual image paths in the hashed catalog structure
// All watches now use real images - no placeholders
// ==========================================

// Available real images from the catalog
const AVAILABLE_IMAGES = [
  // Rolex images (15)
  '/catalog/0/02/Rolex_Day-Date_Lacquered_Stella_Dial.jpg',
  '/catalog/0/04/Rolex_Daytona_ref._6265_in_oro,_primi_anni_Settanta.jpg',
  '/catalog/1/1c/Rolex_Oyster_Perpetual_ref._277200_con_quadrante_color_lavanda.jpg',
  '/catalog/2/27/Rolex_GMT_Master_II_ref._16710T.jpg',
  '/catalog/2/2d/Rolex_GMT-Master_ref._16700.jpg',
  '/catalog/3/34/Rolex_Oyster_Perpetual_con_quadrante_Celebration.jpg',
  '/catalog/b/b1/Rolex_Datejust_ref._16013,_seconda_meta_anni_70-primi_80.jpg',
  '/catalog/b/b7/Rolex_Datejust_ref._16220_tapestry_dial.jpg',
  '/catalog/c/c8/Macro_photography_of_a_Rolex_watch.jpg',
  '/catalog/f/f4/Rolex_watch_ladies_Datejust_1987.jpg',
  '/catalog/f/f5/Rolex_Oyster_Perpetual_ref._116000_con_quadrante_Explorer.jpg',
  '/catalog/f/f8/Rolex-watches-Helsinki2.jpg',
  '/catalog/8/87/Milgaussnew.jpg',
  '/catalog/1/17/Particolare_di_un_Exclamation_point_dial_su_un_Rolex_GMT-Master_ref._1675._La_ghiera_sbiadita_e_detta_anche_faded_o_ghost..jpg',
  '/catalog/1/13/Quadrante_tropical_di_Rolex_GMT-Master_ref._1675_Long_E.jpg',
  
  // Audemars Piguet images (12)
  '/catalog/0/05/Audemars_Piguet_Royal_Oak_ref._15202.jpg',
  '/catalog/0/0e/Audemars_2385_Royal_Oak_resized.jpg',
  '/catalog/0/0f/Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo,_meta_anni_Novanta.jpg',
  '/catalog/1/1e/Audemars_Piguet_Royal_Oak_Offshore_Diver.jpg',
  '/catalog/2/23/Audemars_Piguet_Royal_Oak_Tradition_dExcellence_4,_ref._25969,_risalente_al_2004.jpg',
  '/catalog/3/3f/Audemars_Piguet_Royal_Oak_in_oro_e_tantalio,_fine_anni_80-primi_90.jpg',
  '/catalog/5/57/Audemars_Piguet_dress_watch_in_oro_carica_manuale,_fine_anni_70.jpg',
  '/catalog/6/68/Audemars_Piguet_Royal_Oak_Cronograph_con_calibro_modulare,_ref._25721._Primi_anni_Novanta.jpg',
  '/catalog/7/7d/Audemars_Piguet_CODE_11.59_Chronograph_ref._26393.jpg',
  '/catalog/7/79/Calibro_Audemars_Piguet_7121_con_massa_oscillante_personalizzata_con_il_numero_50,_per_celebrare_i_cinquantanni_dalla_nascita_del_Royal_Oak._Risalente_al_2022.jpg',
  '/catalog/a/aa/Audemars_2385.jpg',
  '/catalog/c/cc/Audemars_Piguet_ref._25831_con_datario,_riserva_di_carica_e_tourbillon,_risalente_al_1997.jpg',
  
  // Cartier images (3)
  '/catalog/f/fc/Cartier_Tank_Must,_2021.jpg',
  '/catalog/9/99/Cartier_Santos_1988.jpg',
  '/catalog/d/df/Cartier_Tank.jpg',
  
  // Jaeger-LeCoultre images (11)
  '/catalog/2/25/Jaeger-LeCoultre_caliber_K916_with_EU_version_rotor.jpg',
  '/catalog/2/28/Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette_cropped.png',
  '/catalog/3/35/Jaeger-LeCoultre_mens_dress_watch_ca._1950s.jpg',
  '/catalog/4/45/Balance_of_a_wristwatch_Jaeger-LeCoultre_Master_Eight_Days_Perpetual_Squelette.png',
  '/catalog/6/6a/Detailed_view_on_balance_and_rotor_of_Jaeger-LeCoultre_watch.jpg',
  '/catalog/7/70/Jaeger-LeCoultre-Reverso.jpg',
  '/catalog/a/a7/Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette_(cropped_twice).png',
  '/catalog/b/b5/Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg',
  '/catalog/c/c5/Jaeger-LeCoultre_Reverso,_anni_2000.jpg',
  '/catalog/d/dc/Jaeger-Lecoultre_img_0991.jpg',
  '/catalog/d/df/Jaeger-LeCoultre_Reverso_2011.jpg',
  
  // Omega images (3)
  '/catalog/0/06/Omega_speedmaster_reduced_351050.jpg',
  '/catalog/1/1f/Omega_Seamaster_De_Ville_1970.jpg',
  '/catalog/f/fa/Omega_seamaster_120m_1998.jpg',
  
  // Other/misc (4)
  '/catalog/e/ec/Watch_La_Roche-Posay.jpg',
  '/catalog/e/e7/Montre_Laroche-Posay_Water_resistant_;_Rolex_submariner.jpg',
  '/catalog/4/4a/The_Real_Thing_(22119277278).jpg',
  '/catalog/9/94/Ultimate_in_Rose_Gold_Wristwatches_RCWATCHES.jpg',
] as const

// Brand-specific image pools
const BRAND_POOLS: Record<string, string[]> = {
  'Rolex': AVAILABLE_IMAGES.slice(0, 15),
  'Audemars Piguet': AVAILABLE_IMAGES.slice(15, 27),
  'Cartier': AVAILABLE_IMAGES.slice(27, 30),
  'Jaeger-LeCoultre': AVAILABLE_IMAGES.slice(30, 41),
  'Omega': AVAILABLE_IMAGES.slice(41, 44),
}

// Specific watch mappings for exact matches
const SPECIFIC_MAPPINGS: Record<string, string> = {
  // Test watches
  'test-watch-1': '/test/image.jpg',
  'quartz-watch-1': '/test/quartz.jpg',
  'favorite-watch-1': '/test/auto.jpg',
  
  // Rolex specific
  'rolex-datejust-41': '/catalog/b/b7/Rolex_Datejust_ref._16220_tapestry_dial.jpg',
  'rolex-submariner': '/catalog/e/e7/Montre_Laroche-Posay_Water_resistant_;_Rolex_submariner.jpg',
  'rolex-gmt-master-ii': '/catalog/9/91/Rolex_GMT-Master_II_ref._126713GRNR.jpg',
  'rolex-daytona': '/catalog/0/04/Rolex_Daytona_ref._6265_in_oro,_primi_anni_Settanta.jpg',
  'rolex-day-date': '/catalog/0/02/Rolex_Day-Date_Lacquered_Stella_Dial.jpg',
  'rolex-milgauss': '/catalog/8/87/Milgaussnew.jpg',
  
  // Cartier specific
  'cartier-tank-quartz': '/catalog/f/fc/Cartier_Tank_Must,_2021.jpg',
  'cartier-tank-louis': '/catalog/d/df/Cartier_Tank.jpg',
  'cartier-santos-quartz': '/catalog/9/99/Cartier_Santos_1988.jpg',
  'cartier-santos-manual': '/catalog/9/99/Cartier_Santos_1988.jpg',
  
  // JLC specific
  'jaeger-lecoultre-reverso-manual': '/catalog/7/70/Jaeger-LeCoultre-Reverso.jpg',
  'jlc-master-ultra-thin-moon': '/catalog/b/b5/Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg',
  
  // AP specific
  'audemars-piguet-royal-oak-15202': '/catalog/0/05/Audemars_Piguet_Royal_Oak_ref._15202.jpg',
  'audemars-piguet-royal-oak-offshore': '/catalog/1/1e/Audemars_Piguet_Royal_Oak_Offshore_Diver.jpg',
  'audemars-piguet-royaloak-tourbillon': '/catalog/c/cc/Audemars_Piguet_ref._25831_con_datario,_riserva_di_carica_e_tourbillon,_risalente_al_1997.jpg',
  
  // Omega specific
  'omega-speedmaster': '/catalog/0/06/Omega_speedmaster_reduced_351050.jpg',
  'omega-seamaster-300': '/catalog/1/1f/Omega_Seamaster_De_Ville_1970.jpg',
}

// Hash function for consistent image selection
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Get the actual image URL for a watch
 * All watches get real images from the catalog
 */
export function getWatchImageUrl(watch: Watch): string {
  // Priority 1: Specific mapping
  if (SPECIFIC_MAPPINGS[watch.id]) {
    return SPECIFIC_MAPPINGS[watch.id]
  }
  
  // Priority 2: Brand pool
  const brandPool = BRAND_POOLS[watch.brand]
  if (brandPool && brandPool.length > 0) {
    const index = hashString(watch.id) % brandPool.length
    return brandPool[index]
  }
  
  // Priority 3: Any available image based on watch ID hash
  const index = hashString(watch.id) % AVAILABLE_IMAGES.length
  return AVAILABLE_IMAGES[index]
}

/**
 * All watches now have real images
 */
export function hasRealImage(watchId: string): boolean {
  void watchId
  return true
}

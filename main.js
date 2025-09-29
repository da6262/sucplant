// 경산다육식물농장 관리시스템 - 메인 진입점
// 모듈화된 구조의 시작점

// 공통 유틸리티 함수들 import
import { TABLE_MAP, mapTable, getLocalStorageKey } from './utils/helpers.js';

// Supabase 설정 import
import { getSupabaseClient, initializeSupabase } from './config/supabaseConfig.js';

// Supabase 서비스 함수들 import
import { saveRow, deleteRow, loadRows, initialSync, setupRealtime, applyRealtimeDelta } from './services/supabaseService.js';

// 고객 데이터 모듈 import
import { 
    farm_customers, 
    CUSTOMER_GRADES, 
    loadCustomers, 
    saveCustomer, 
    deleteCustomer, 
    searchCustomers, 
    filterCustomersByGrade, 
    calculateCustomerGrade, 
    findCustomerById, 
    findCustomerByPhone, 
    saveCustomerIfNew 
} from './features/customers/customerData.js';

// 전역에서 사용할 수 있도록 window 객체에 등록
window.TABLE_MAP = TABLE_MAP;
window.mapTable = mapTable;
window.getLocalStorageKey = getLocalStorageKey;
window.saveRow = saveRow;
window.deleteRow = deleteRow;
window.loadRows = loadRows;
window.initialSync = initialSync;
window.setupRealtime = setupRealtime;
window.applyRealtimeDelta = applyRealtimeDelta;

// 고객 관련 함수들 전역 등록
window.farm_customers = farm_customers;
window.CUSTOMER_GRADES = CUSTOMER_GRADES;
window.loadCustomers = loadCustomers;
window.saveCustomer = saveCustomer;
window.deleteCustomer = deleteCustomer;
window.searchCustomers = searchCustomers;
window.filterCustomersByGrade = filterCustomersByGrade;
window.calculateCustomerGrade = calculateCustomerGrade;
window.findCustomerById = findCustomerById;
window.findCustomerByPhone = findCustomerByPhone;
window.saveCustomerIfNew = saveCustomerIfNew;

console.log('🚀 경산다육식물농장 관리시스템 시작!');
console.log('📦 공통 유틸리티 함수 로드 완료');

// Supabase 초기화
initializeSupabase();
console.log('🗄️ Supabase 서비스 로드 완료');
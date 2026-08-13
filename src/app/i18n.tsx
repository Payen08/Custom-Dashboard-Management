import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Languages } from 'lucide-react';

export type AppLocale = 'zh-Hans' | 'en' | 'ms' | 'vi' | 'zh-Hant';

export type GlobalActionKey = 'create' | 'add' | 'edit' | 'delete' | 'remove' | 'save' | 'refresh' | 'search' | 'reset' | 'import' | 'export' | 'cancel';

export const GLOBAL_ACTION_COPY: Record<AppLocale, Record<GlobalActionKey, string>> = {
  'zh-Hans': { create:'新增', add:'添加', edit:'编辑', delete:'删除', remove:'移除', save:'保存', refresh:'刷新', search:'搜索', reset:'重置', import:'导入', export:'导出', cancel:'取消' },
  en: { create:'Create', add:'Add', edit:'Edit', delete:'Delete', remove:'Remove', save:'Save', refresh:'Refresh', search:'Search', reset:'Reset', import:'Import', export:'Export', cancel:'Cancel' },
  ms: { create:'Cipta', add:'Tambah', edit:'Edit', delete:'Padam', remove:'Alih Keluar', save:'Simpan', refresh:'Muat Semula', search:'Cari', reset:'Tetap Semula', import:'Import', export:'Eksport', cancel:'Batal' },
  vi: { create:'Tạo', add:'Thêm', edit:'Chỉnh sửa', delete:'Xóa', remove:'Gỡ bỏ', save:'Lưu', refresh:'Làm mới', search:'Tìm kiếm', reset:'Đặt lại', import:'Nhập', export:'Xuất', cancel:'Hủy' },
  'zh-Hant': { create:'新增', add:'添加', edit:'編輯', delete:'刪除', remove:'移除', save:'儲存', refresh:'重新整理', search:'搜尋', reset:'重設', import:'匯入', export:'匯出', cancel:'取消' },
};

const LOCALE_STORAGE_KEY = 'moying-workspace-locale';

const LANGUAGE_OPTIONS: Array<{ value: AppLocale; label: string; short: string }> = [
  { value: 'zh-Hans', label: '简体中文', short: '简中' },
  { value: 'en', label: 'English', short: 'EN' },
  { value: 'ms', label: 'Bahasa Melayu', short: 'MS' },
  { value: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { value: 'zh-Hant', label: '繁體中文', short: '繁中' },
];

type Copy = { standard: string; short?: string };
type Dictionary = Record<string, Copy>;

const dictionaries: Record<AppLocale, Dictionary> = {
  'zh-Hans': {
    workbench: { standard: '墨影工作台', short: '工作台' }, devCenter: { standard: '产品与设备开发中心', short: '开发中心' }, returnLogin: { standard: '返回登录', short: '退出' }, lightMode: { standard: '切换为浅色模式', short: '浅色模式' }, darkMode: { standard: '切换为暗色模式', short: '暗色模式' }, greeting: { standard: '上午好，robot-admin', short: '你好，robot-admin' }, intro: { standard: '从一个工作台进入软件、授权、数字造机与智能制造能力。', short: '从工作台进入所有产品。' }, healthy: { standard: '所有服务运行正常', short: '系统正常' }, workspaceList: { standard: '工作空间列表' },
    digitalMachine: { standard: '数字造机' }, digitalMachineDesc: { standard: '从机器人型号、三维模型到组件生态与运行面板，完成数字设备配置。', short: '配置型号、组件与运行面板。' }, enterWorkspace: { standard: '进入工作空间', short: '进入' }, smartManufacturing: { standard: '智能制造', short: '制造' }, manufacturingDesc: { standard: '贯通工单、工装、工作台与生产基础数据，追踪制造全过程。', short: '管理工单与生产数据。' }, softwareManagement: { standard: '软件管理', short: '软件' }, softwareDesc: { standard: '统一管理软件包、产品版本、测试包与发布流程。', short: '管理软件包、版本与发布。' }, authorization: { standard: '授权平台', short: '授权' }, authorizationDesc: { standard: '集中配置产品授权、许可策略与设备使用权限。', short: '管理授权与设备权限。' }, recent: { standard: '最近访问', short: '最近' }, today: { standard: '今天 09:42' },
    signInTo: { standard: '登录到' }, accountPlaceholder: { standard: '请输入账号', short: '账号' }, account: { standard: '账号' }, passwordPlaceholder: { standard: '请输入密码', short: '密码' }, password: { standard: '密码' }, showPassword: { standard: '显示密码', short: '显示' }, hidePassword: { standard: '隐藏密码', short: '隐藏' }, credentialsRequired: { standard: '请输入账号和密码', short: '需要账号和密码' }, signIn: { standard: '登录' }, editServices: { standard: '修改服务地址', short: '服务设置' }, serviceAddresses: { standard: '服务地址', short: '服务' }, backToLogin: { standard: '返回登录', short: '返回' }, import: { standard: '导入' }, export: { standard: '导出' }, testAll: { standard: '测试全部服务', short: '测试全部' }, save: { standard: '保存设置', short: '保存' }, backendAddress: { standard: '后端服务地址', short: '后端地址' }, fileAddress: { standard: '文件服务地址', short: '文件地址' }, frontendAddress: { standard: '前端服务地址', short: '前端地址' }, mqttAddress: { standard: '消息队列地址', short: 'MQTT 地址' }, example: { standard: '例如：' }, testing: { standard: '正在测试连接…', short: '测试中…' }, testSuccess: { standard: '地址格式与连接配置可用', short: '连接可用' }, testError: { standard: '地址不可用，请检查协议和端口', short: '检查协议与端口' }, search: { standard: '搜索' }, currentStyle: { standard: '恢复当前风格', short: '当前风格' }, industrialStyle: { standard: '切换为工业风格', short: '工业风格' }, notifications: { standard: '通知' }, refresh: { standard: '刷新' },
  },
  en: {
    workbench: { standard: 'Moying Workbench', short: 'Workbench' },
    devCenter: { standard: 'Product & Device Development Center', short: 'Development Center' },
    returnLogin: { standard: 'Return to sign in', short: 'Sign out' },
    lightMode: { standard: 'Switch to light mode', short: 'Light mode' },
    darkMode: { standard: 'Switch to dark mode', short: 'Dark mode' },
    greeting: { standard: 'Good morning, robot-admin', short: 'Hello, robot-admin' },
    intro: { standard: 'Access software, licensing, digital machine and smart manufacturing capabilities from one workbench.', short: 'Access every product from one workbench.' },
    healthy: { standard: 'All services are operating normally', short: 'All systems normal' },
    workspaceList: { standard: 'Workspace list' },
    digitalMachine: { standard: 'Digital Machine', short: 'Machine' },
    digitalMachineDesc: { standard: 'Configure digital equipment from robot models and 3D assets to components and runtime dashboards.', short: 'Configure models, components and dashboards.' },
    enterWorkspace: { standard: 'Enter workspace', short: 'Open' },
    smartManufacturing: { standard: 'Smart Manufacturing', short: 'Manufacturing' },
    manufacturingDesc: { standard: 'Connect work orders, tooling, workstations and production master data across manufacturing.', short: 'Manage work orders and production data.' },
    softwareManagement: { standard: 'Software Management', short: 'Software' },
    softwareDesc: { standard: 'Manage software packages, product versions, test builds and release workflows in one place.', short: 'Manage packages, versions and releases.' },
    authorization: { standard: 'Authorization Platform', short: 'Licensing' },
    authorizationDesc: { standard: 'Configure product licenses, licensing policies and device permissions centrally.', short: 'Manage licenses and device access.' },
    recent: { standard: 'Recently visited', short: 'Recent' },
    today: { standard: 'Today 09:42' },
    signInTo: { standard: 'Sign in to' },
    accountPlaceholder: { standard: 'Enter your account', short: 'Account' },
    account: { standard: 'Account' },
    passwordPlaceholder: { standard: 'Enter your password', short: 'Password' },
    password: { standard: 'Password' },
    showPassword: { standard: 'Show password', short: 'Show' },
    hidePassword: { standard: 'Hide password', short: 'Hide' },
    credentialsRequired: { standard: 'Enter your account and password', short: 'Account and password required' },
    signIn: { standard: 'Sign in' },
    editServices: { standard: 'Change service addresses', short: 'Service settings' },
    serviceAddresses: { standard: 'Service addresses', short: 'Services' },
    backToLogin: { standard: 'Back to sign in', short: 'Back' },
    import: { standard: 'Import' }, export: { standard: 'Export' },
    testAll: { standard: 'Test all services', short: 'Test all' },
    save: { standard: 'Save settings', short: 'Save' },
    backendAddress: { standard: 'Backend service address', short: 'Backend address' },
    fileAddress: { standard: 'File service address', short: 'File address' },
    frontendAddress: { standard: 'Frontend service address', short: 'Frontend address' },
    mqttAddress: { standard: 'Message queue address', short: 'MQTT address' },
    example: { standard: 'Example:' },
    testing: { standard: 'Testing connection…', short: 'Testing…' },
    testSuccess: { standard: 'The address format and connection settings are valid', short: 'Connection available' },
    testError: { standard: 'Address unavailable. Check the protocol and port.', short: 'Check protocol and port' },
    search: { standard: 'Search' },
    currentStyle: { standard: 'Switch to current style', short: 'Current style' },
    industrialStyle: { standard: 'Switch to industrial style', short: 'Industrial style' },
    notifications: { standard: 'Notifications', short: 'Alerts' },
    refresh: { standard: 'Refresh' },
  },
  ms: {
    workbench: { standard: 'Ruang Kerja Moying', short: 'Ruang Kerja' }, devCenter: { standard: 'Pusat Pembangunan Produk & Peranti', short: 'Pusat Pembangunan' },
    returnLogin: { standard: 'Kembali ke log masuk', short: 'Log keluar' }, lightMode: { standard: 'Tukar ke mod cerah', short: 'Mod cerah' }, darkMode: { standard: 'Tukar ke mod gelap', short: 'Mod gelap' },
    greeting: { standard: 'Selamat pagi, robot-admin', short: 'Hai, robot-admin' }, intro: { standard: 'Akses perisian, pelesenan, mesin digital dan pembuatan pintar daripada satu ruang kerja.', short: 'Akses semua produk di satu ruang kerja.' }, healthy: { standard: 'Semua perkhidmatan beroperasi seperti biasa', short: 'Semua sistem normal' }, workspaceList: { standard: 'Senarai ruang kerja' },
    digitalMachine: { standard: 'Mesin Digital' }, digitalMachineDesc: { standard: 'Konfigurasikan peralatan digital daripada model robot dan aset 3D hingga komponen dan papan pemuka operasi.', short: 'Konfigurasi model, komponen dan papan pemuka.' }, enterWorkspace: { standard: 'Masuk ruang kerja', short: 'Buka' },
    smartManufacturing: { standard: 'Pembuatan Pintar', short: 'Pembuatan' }, manufacturingDesc: { standard: 'Hubungkan pesanan kerja, perkakas, stesen kerja dan data induk pengeluaran.', short: 'Urus pesanan kerja dan data pengeluaran.' }, softwareManagement: { standard: 'Pengurusan Perisian', short: 'Perisian' }, softwareDesc: { standard: 'Urus pakej perisian, versi produk, binaan ujian dan aliran keluaran.', short: 'Urus pakej, versi dan keluaran.' }, authorization: { standard: 'Platform Kebenaran', short: 'Pelesenan' }, authorizationDesc: { standard: 'Konfigurasikan lesen produk, dasar pelesenan dan kebenaran peranti secara berpusat.', short: 'Urus lesen dan akses peranti.' },
    recent: { standard: 'Baru dilawati', short: 'Terkini' }, today: { standard: 'Hari ini 09:42' }, signInTo: { standard: 'Log masuk ke' }, accountPlaceholder: { standard: 'Masukkan akaun anda', short: 'Akaun' }, account: { standard: 'Akaun' }, passwordPlaceholder: { standard: 'Masukkan kata laluan', short: 'Kata laluan' }, password: { standard: 'Kata laluan' }, showPassword: { standard: 'Tunjukkan kata laluan', short: 'Tunjuk' }, hidePassword: { standard: 'Sembunyikan kata laluan', short: 'Sembunyi' }, credentialsRequired: { standard: 'Masukkan akaun dan kata laluan', short: 'Akaun dan kata laluan diperlukan' }, signIn: { standard: 'Log masuk' }, editServices: { standard: 'Ubah alamat perkhidmatan', short: 'Tetapan servis' }, serviceAddresses: { standard: 'Alamat perkhidmatan', short: 'Perkhidmatan' }, backToLogin: { standard: 'Kembali ke log masuk', short: 'Kembali' }, import: { standard: 'Import' }, export: { standard: 'Eksport' }, testAll: { standard: 'Uji semua perkhidmatan', short: 'Uji semua' }, save: { standard: 'Simpan tetapan', short: 'Simpan' }, backendAddress: { standard: 'Alamat perkhidmatan backend', short: 'Alamat backend' }, fileAddress: { standard: 'Alamat perkhidmatan fail', short: 'Alamat fail' }, frontendAddress: { standard: 'Alamat perkhidmatan frontend', short: 'Alamat frontend' }, mqttAddress: { standard: 'Alamat baris gilir mesej', short: 'Alamat MQTT' }, example: { standard: 'Contoh:' }, testing: { standard: 'Menguji sambungan…', short: 'Menguji…' }, testSuccess: { standard: 'Format alamat dan tetapan sambungan sah', short: 'Sambungan tersedia' }, testError: { standard: 'Alamat tidak tersedia. Semak protokol dan port.', short: 'Semak protokol dan port' }, search: { standard: 'Cari' }, currentStyle: { standard: 'Tukar ke gaya semasa', short: 'Gaya semasa' }, industrialStyle: { standard: 'Tukar ke gaya industri', short: 'Gaya industri' }, notifications: { standard: 'Pemberitahuan', short: 'Makluman' }, refresh: { standard: 'Muat semula' },
  },
  vi: {
    workbench: { standard: 'Không gian làm việc Moying', short: 'Moying Workspace' }, devCenter: { standard: 'Trung tâm phát triển sản phẩm & thiết bị', short: 'Trung tâm phát triển' }, returnLogin: { standard: 'Quay lại đăng nhập', short: 'Đăng xuất' }, lightMode: { standard: 'Chuyển sang giao diện sáng', short: 'Giao diện sáng' }, darkMode: { standard: 'Chuyển sang giao diện tối', short: 'Giao diện tối' }, greeting: { standard: 'Chào buổi sáng, robot-admin', short: 'Xin chào, robot-admin' }, intro: { standard: 'Truy cập phần mềm, cấp phép, máy kỹ thuật số và sản xuất thông minh từ một không gian làm việc.', short: 'Truy cập mọi sản phẩm tại một nơi.' }, healthy: { standard: 'Tất cả dịch vụ đang hoạt động bình thường', short: 'Mọi hệ thống bình thường' }, workspaceList: { standard: 'Danh sách không gian làm việc' },
    digitalMachine: { standard: 'Máy kỹ thuật số', short: 'Máy số' }, digitalMachineDesc: { standard: 'Cấu hình thiết bị kỹ thuật số từ mô hình robot và tài sản 3D đến thành phần và bảng điều khiển.', short: 'Cấu hình mô hình, thành phần và bảng điều khiển.' }, enterWorkspace: { standard: 'Vào không gian làm việc', short: 'Mở' }, smartManufacturing: { standard: 'Sản xuất thông minh', short: 'Sản xuất' }, manufacturingDesc: { standard: 'Kết nối lệnh sản xuất, dụng cụ, trạm làm việc và dữ liệu sản xuất nền tảng.', short: 'Quản lý lệnh và dữ liệu sản xuất.' }, softwareManagement: { standard: 'Quản lý phần mềm', short: 'Phần mềm' }, softwareDesc: { standard: 'Quản lý gói phần mềm, phiên bản sản phẩm, bản thử nghiệm và quy trình phát hành.', short: 'Quản lý gói, phiên bản và phát hành.' }, authorization: { standard: 'Nền tảng cấp phép', short: 'Cấp phép' }, authorizationDesc: { standard: 'Quản lý tập trung giấy phép sản phẩm, chính sách và quyền truy cập thiết bị.', short: 'Quản lý giấy phép và quyền thiết bị.' },
    recent: { standard: 'Truy cập gần đây', short: 'Gần đây' }, today: { standard: 'Hôm nay 09:42' }, signInTo: { standard: 'Đăng nhập vào' }, accountPlaceholder: { standard: 'Nhập tài khoản', short: 'Tài khoản' }, account: { standard: 'Tài khoản' }, passwordPlaceholder: { standard: 'Nhập mật khẩu', short: 'Mật khẩu' }, password: { standard: 'Mật khẩu' }, showPassword: { standard: 'Hiện mật khẩu', short: 'Hiện' }, hidePassword: { standard: 'Ẩn mật khẩu', short: 'Ẩn' }, credentialsRequired: { standard: 'Vui lòng nhập tài khoản và mật khẩu', short: 'Cần tài khoản và mật khẩu' }, signIn: { standard: 'Đăng nhập' }, editServices: { standard: 'Thay đổi địa chỉ dịch vụ', short: 'Cài đặt dịch vụ' }, serviceAddresses: { standard: 'Địa chỉ dịch vụ', short: 'Dịch vụ' }, backToLogin: { standard: 'Quay lại đăng nhập', short: 'Quay lại' }, import: { standard: 'Nhập' }, export: { standard: 'Xuất' }, testAll: { standard: 'Kiểm tra tất cả dịch vụ', short: 'Kiểm tra tất cả' }, save: { standard: 'Lưu cài đặt', short: 'Lưu' }, backendAddress: { standard: 'Địa chỉ dịch vụ backend', short: 'Địa chỉ backend' }, fileAddress: { standard: 'Địa chỉ dịch vụ tệp', short: 'Địa chỉ tệp' }, frontendAddress: { standard: 'Địa chỉ dịch vụ frontend', short: 'Địa chỉ frontend' }, mqttAddress: { standard: 'Địa chỉ hàng đợi tin nhắn', short: 'Địa chỉ MQTT' }, example: { standard: 'Ví dụ:' }, testing: { standard: 'Đang kiểm tra kết nối…', short: 'Đang kiểm tra…' }, testSuccess: { standard: 'Định dạng địa chỉ và cấu hình kết nối hợp lệ', short: 'Kết nối khả dụng' }, testError: { standard: 'Địa chỉ không khả dụng. Kiểm tra giao thức và cổng.', short: 'Kiểm tra giao thức và cổng' }, search: { standard: 'Tìm kiếm' }, currentStyle: { standard: 'Chuyển về kiểu hiện tại', short: 'Kiểu hiện tại' }, industrialStyle: { standard: 'Chuyển sang kiểu công nghiệp', short: 'Kiểu công nghiệp' }, notifications: { standard: 'Thông báo', short: 'Cảnh báo' }, refresh: { standard: 'Làm mới' },
  },
  'zh-Hant': {
    workbench: { standard: '墨影工作臺', short: '工作臺' }, devCenter: { standard: '產品與設備開發中心', short: '開發中心' }, returnLogin: { standard: '返回登入', short: '登出' }, lightMode: { standard: '切換為淺色模式', short: '淺色模式' }, darkMode: { standard: '切換為深色模式', short: '深色模式' }, greeting: { standard: '上午好，robot-admin', short: '你好，robot-admin' }, intro: { standard: '從一個工作臺進入軟體、授權、數位造機與智慧製造能力。', short: '從工作臺進入所有產品。' }, healthy: { standard: '所有服務運行正常', short: '系統正常' }, workspaceList: { standard: '工作空間列表' }, digitalMachine: { standard: '數位造機' }, digitalMachineDesc: { standard: '從機器人型號、三維模型到元件生態與運行面板，完成數位設備配置。', short: '配置型號、元件與運行面板。' }, enterWorkspace: { standard: '進入工作空間', short: '進入' }, smartManufacturing: { standard: '智慧製造', short: '製造' }, manufacturingDesc: { standard: '貫通工單、工裝、工作臺與生產基礎資料，追蹤製造全過程。', short: '管理工單與生產資料。' }, softwareManagement: { standard: '軟體管理', short: '軟體' }, softwareDesc: { standard: '統一管理軟體包、產品版本、測試包與發佈流程。', short: '管理軟體包、版本與發佈。' }, authorization: { standard: '授權平臺', short: '授權' }, authorizationDesc: { standard: '集中配置產品授權、許可策略與設備使用權限。', short: '管理授權與設備權限。' }, recent: { standard: '最近訪問', short: '最近' }, today: { standard: '今天 09:42' },
    signInTo: { standard: '登入到' }, accountPlaceholder: { standard: '請輸入帳號', short: '帳號' }, account: { standard: '帳號' }, passwordPlaceholder: { standard: '請輸入密碼', short: '密碼' }, password: { standard: '密碼' }, showPassword: { standard: '顯示密碼', short: '顯示' }, hidePassword: { standard: '隱藏密碼', short: '隱藏' }, credentialsRequired: { standard: '請輸入帳號和密碼', short: '需要帳號和密碼' }, signIn: { standard: '登入' }, editServices: { standard: '修改服務地址', short: '服務設定' }, serviceAddresses: { standard: '服務地址', short: '服務' }, backToLogin: { standard: '返回登入', short: '返回' }, import: { standard: '匯入' }, export: { standard: '匯出' }, testAll: { standard: '測試全部服務', short: '全部測試' }, save: { standard: '儲存設定', short: '儲存' }, backendAddress: { standard: '後端服務地址', short: '後端地址' }, fileAddress: { standard: '檔案服務地址', short: '檔案地址' }, frontendAddress: { standard: '前端服務地址', short: '前端地址' }, mqttAddress: { standard: '訊息佇列地址', short: 'MQTT 地址' }, example: { standard: '例如：' }, testing: { standard: '正在測試連線…', short: '測試中…' }, testSuccess: { standard: '地址格式與連線設定可用', short: '連線可用' }, testError: { standard: '地址不可用，請檢查協定和連接埠', short: '檢查協定與連接埠' }, search: { standard: '搜尋' }, currentStyle: { standard: '恢復目前風格', short: '目前風格' }, industrialStyle: { standard: '切換為工業風格', short: '工業風格' }, notifications: { standard: '通知' }, refresh: { standard: '重新整理' },
  },
};

const productUiDictionaries: Record<AppLocale, Dictionary> = {
  'zh-Hans': {
    navCustomHome: { standard: '首页自定义', short: '首页' }, navModelTemplates: { standard: '型号模板', short: '模板' }, navComponentLibrary: { standard: '组件库' }, navComponentLibrary2: { standard: '组件库2', short: '组件2' }, navVersionManagement: { standard: '版本管理', short: '版本' }, navSoftwareProducts: { standard: '软件产品', short: '软件' }, navInstallations: { standard: '装机记录', short: '装机' }, navDictionary: { standard: '字典配置', short: '字典' }, navData: { standard: '数据管理', short: '数据' }, navGuidelines: { standard: '设计规范', short: '规范' }, navInteractionSpecs: { standard: '交互规范', short: '交互' }, dataFieldDictionary: { standard: '字段字典', short: '字典' }, dataTemplates: { standard: '构型模板', short: '模板' }, dataParameters: { standard: '参数定义', short: '参数' }, platformSubtitle: { standard: '软件管理与授权平台', short: '管理与授权平台' }, editorNavigation: { standard: '编辑器模块切换' },
    customHomepage: { standard: '自定义首页', short: '首页' }, schemes: { standard: '个方案' }, selectScheme: { standard: '选择首页方案：' }, updated: { standard: '更新' }, moreActions: { standard: '更多操作' }, rename: { standard: '重命名' }, copyScheme: { standard: '复制方案', short: '复制' }, exportHomepage: { standard: '导出首页', short: '导出' }, deleteHomepage: { standard: '删除首页', short: '删除' }, noMatchingHomepage: { standard: '未找到匹配的首页', short: '无匹配首页' }, componentManagement: { standard: '组件管理', short: '组件' }, addHomepage: { standard: '新增首页', short: '新增' }, renamePanel: { standard: '重命名面板', short: '重命名' }, cancel: { standard: '取消' }, confirm: { standard: '确认' }, homepageNamePlaceholder: { standard: '请输入首页名称', short: '首页名称' }, compositeRobot: { standard: 'MCR复合机器人', short: 'MCR' }, agvRobot: { standard: 'AGV搬运机器人', short: 'AGV' }, inspectionRobot: { standard: '巡检机器人', short: '巡检' }, customHomepageSuffix: { standard: '自定义首页-01', short: '首页-01' }, homepageDescription: { standard: '根据现场任务和设备状态搭建首页', short: '按任务和设备状态搭建首页' }, delete: { standard: '删除' }, exportPanel: { standard: '导出面板', short: '导出' }, editPanel: { standard: '编辑面板', short: '编辑' }, homepage: { standard: '首页' },
  },
  en: {
    navCustomHome: { standard: 'Custom Home', short: 'Home' }, navModelTemplates: { standard: 'Model Templates', short: 'Models' }, navComponentLibrary: { standard: 'Component Library', short: 'Components' }, navComponentLibrary2: { standard: 'Component Library 2', short: 'Components 2' }, navVersionManagement: { standard: 'Version Management', short: 'Versions' }, navSoftwareProducts: { standard: 'Software Products', short: 'Software' }, navInstallations: { standard: 'Installation Records', short: 'Installations' }, navDictionary: { standard: 'Dictionary Settings', short: 'Dictionary' }, navData: { standard: 'Data Management', short: 'Data' }, navGuidelines: { standard: 'Design Guidelines', short: 'Guidelines' }, navInteractionSpecs: { standard: 'Interaction Guidelines', short: 'Interaction' }, dataFieldDictionary: { standard: 'Field Dictionary', short: 'Dictionary' }, dataTemplates: { standard: 'Configuration Templates', short: 'Templates' }, dataParameters: { standard: 'Parameter Definitions', short: 'Parameters' }, platformSubtitle: { standard: 'Software Management & Licensing', short: 'Management & Licensing' }, editorNavigation: { standard: 'Editor navigation' },
    customHomepage: { standard: 'Custom Homepages', short: 'Homepages' }, schemes: { standard: 'schemes' }, selectScheme: { standard: 'Select homepage scheme: ' }, updated: { standard: 'Updated' }, moreActions: { standard: 'More actions' }, rename: { standard: 'Rename' }, copyScheme: { standard: 'Duplicate scheme', short: 'Duplicate' }, exportHomepage: { standard: 'Export homepage', short: 'Export' }, deleteHomepage: { standard: 'Delete homepage', short: 'Delete' }, noMatchingHomepage: { standard: 'No matching homepages found', short: 'No matches' }, componentManagement: { standard: 'Manage components', short: 'Components' }, addHomepage: { standard: 'Add homepage', short: 'Add' }, renamePanel: { standard: 'Rename panel', short: 'Rename' }, cancel: { standard: 'Cancel' }, confirm: { standard: 'Confirm' }, homepageNamePlaceholder: { standard: 'Enter a homepage name', short: 'Homepage name' }, compositeRobot: { standard: 'MCR Composite Robot', short: 'MCR Robot' }, agvRobot: { standard: 'AGV Transport Robot', short: 'AGV Robot' }, inspectionRobot: { standard: 'Inspection Robot', short: 'Inspector' }, customHomepageSuffix: { standard: 'Custom Homepage-01', short: 'Home-01' }, homepageDescription: { standard: 'Build a homepage around on-site tasks and device status', short: 'Build from tasks and device status' }, delete: { standard: 'Delete' }, exportPanel: { standard: 'Export panel', short: 'Export' }, editPanel: { standard: 'Edit panel', short: 'Edit' }, homepage: { standard: 'Homepage', short: 'Home' },
  },
  ms: {
    navCustomHome: { standard: 'Laman Utama Tersuai', short: 'Laman Utama' }, navModelTemplates: { standard: 'Templat Model', short: 'Model' }, navComponentLibrary: { standard: 'Pustaka Komponen', short: 'Komponen' }, navComponentLibrary2: { standard: 'Pustaka Komponen 2', short: 'Komponen 2' }, navVersionManagement: { standard: 'Pengurusan Versi', short: 'Versi' }, navSoftwareProducts: { standard: 'Produk Perisian', short: 'Perisian' }, navInstallations: { standard: 'Rekod Pemasangan', short: 'Pemasangan' }, navDictionary: { standard: 'Tetapan Kamus', short: 'Kamus' }, navData: { standard: 'Pengurusan Data', short: 'Data' }, navGuidelines: { standard: 'Garis Panduan Reka Bentuk', short: 'Panduan' }, navInteractionSpecs: { standard: 'Garis Panduan Interaksi', short: 'Interaksi' }, dataFieldDictionary: { standard: 'Kamus Medan', short: 'Kamus' }, dataTemplates: { standard: 'Templat Konfigurasi', short: 'Templat' }, dataParameters: { standard: 'Definisi Parameter', short: 'Parameter' }, platformSubtitle: { standard: 'Pengurusan Perisian & Pelesenan', short: 'Pengurusan & Lesen' }, editorNavigation: { standard: 'Navigasi editor' },
    customHomepage: { standard: 'Laman Utama Tersuai', short: 'Laman Utama' }, schemes: { standard: 'skim' }, selectScheme: { standard: 'Pilih skim laman utama: ' }, updated: { standard: 'Dikemas kini' }, moreActions: { standard: 'Tindakan lain' }, rename: { standard: 'Namakan semula' }, copyScheme: { standard: 'Salin skim', short: 'Salin' }, exportHomepage: { standard: 'Eksport laman utama', short: 'Eksport' }, deleteHomepage: { standard: 'Padam laman utama', short: 'Padam' }, noMatchingHomepage: { standard: 'Tiada laman utama yang sepadan', short: 'Tiada padanan' }, componentManagement: { standard: 'Urus komponen', short: 'Komponen' }, addHomepage: { standard: 'Tambah laman utama', short: 'Tambah' }, renamePanel: { standard: 'Namakan semula panel', short: 'Nama semula' }, cancel: { standard: 'Batal' }, confirm: { standard: 'Sahkan' }, homepageNamePlaceholder: { standard: 'Masukkan nama laman utama', short: 'Nama laman' }, compositeRobot: { standard: 'Robot Komposit MCR', short: 'Robot MCR' }, agvRobot: { standard: 'Robot Pengangkut AGV', short: 'Robot AGV' }, inspectionRobot: { standard: 'Robot Pemeriksaan', short: 'Pemeriksa' }, customHomepageSuffix: { standard: 'Laman Utama Tersuai-01', short: 'Laman-01' }, homepageDescription: { standard: 'Bina laman utama berdasarkan tugas tapak dan status peranti', short: 'Bina daripada tugas dan status peranti' }, delete: { standard: 'Padam' }, exportPanel: { standard: 'Eksport panel', short: 'Eksport' }, editPanel: { standard: 'Edit panel', short: 'Edit' }, homepage: { standard: 'Laman Utama', short: 'Laman' },
  },
  vi: {
    navCustomHome: { standard: 'Trang chủ tùy chỉnh', short: 'Trang chủ' }, navModelTemplates: { standard: 'Mẫu mô hình', short: 'Mô hình' }, navComponentLibrary: { standard: 'Thư viện thành phần', short: 'Thành phần' }, navComponentLibrary2: { standard: 'Thư viện thành phần 2', short: 'Thành phần 2' }, navVersionManagement: { standard: 'Quản lý phiên bản', short: 'Phiên bản' }, navSoftwareProducts: { standard: 'Sản phẩm phần mềm', short: 'Phần mềm' }, navInstallations: { standard: 'Lịch sử cài đặt', short: 'Cài đặt' }, navDictionary: { standard: 'Cấu hình từ điển', short: 'Từ điển' }, navData: { standard: 'Quản lý dữ liệu', short: 'Dữ liệu' }, navGuidelines: { standard: 'Hướng dẫn thiết kế', short: 'Hướng dẫn' }, navInteractionSpecs: { standard: 'Hướng dẫn tương tác', short: 'Tương tác' }, dataFieldDictionary: { standard: 'Từ điển trường', short: 'Từ điển' }, dataTemplates: { standard: 'Mẫu cấu hình', short: 'Mẫu' }, dataParameters: { standard: 'Định nghĩa tham số', short: 'Tham số' }, platformSubtitle: { standard: 'Quản lý phần mềm & cấp phép', short: 'Quản lý & cấp phép' }, editorNavigation: { standard: 'Điều hướng trình chỉnh sửa' },
    customHomepage: { standard: 'Trang chủ tùy chỉnh', short: 'Trang chủ' }, schemes: { standard: 'phương án' }, selectScheme: { standard: 'Chọn phương án trang chủ: ' }, updated: { standard: 'Đã cập nhật' }, moreActions: { standard: 'Thao tác khác' }, rename: { standard: 'Đổi tên' }, copyScheme: { standard: 'Sao chép phương án', short: 'Sao chép' }, exportHomepage: { standard: 'Xuất trang chủ', short: 'Xuất' }, deleteHomepage: { standard: 'Xóa trang chủ', short: 'Xóa' }, noMatchingHomepage: { standard: 'Không tìm thấy trang chủ phù hợp', short: 'Không có kết quả' }, componentManagement: { standard: 'Quản lý thành phần', short: 'Thành phần' }, addHomepage: { standard: 'Thêm trang chủ', short: 'Thêm' }, renamePanel: { standard: 'Đổi tên bảng', short: 'Đổi tên' }, cancel: { standard: 'Hủy' }, confirm: { standard: 'Xác nhận' }, homepageNamePlaceholder: { standard: 'Nhập tên trang chủ', short: 'Tên trang chủ' }, compositeRobot: { standard: 'Robot tổ hợp MCR', short: 'Robot MCR' }, agvRobot: { standard: 'Robot vận chuyển AGV', short: 'Robot AGV' }, inspectionRobot: { standard: 'Robot kiểm tra', short: 'Kiểm tra' }, customHomepageSuffix: { standard: 'Trang chủ tùy chỉnh-01', short: 'Trang chủ-01' }, homepageDescription: { standard: 'Xây dựng trang chủ theo tác vụ hiện trường và trạng thái thiết bị', short: 'Xây dựng từ tác vụ và trạng thái thiết bị' }, delete: { standard: 'Xóa' }, exportPanel: { standard: 'Xuất bảng', short: 'Xuất' }, editPanel: { standard: 'Chỉnh sửa bảng', short: 'Chỉnh sửa' }, homepage: { standard: 'Trang chủ' },
  },
  'zh-Hant': {
    navCustomHome: { standard: '首頁自訂', short: '首頁' }, navModelTemplates: { standard: '型號範本', short: '範本' }, navComponentLibrary: { standard: '元件庫' }, navComponentLibrary2: { standard: '元件庫2', short: '元件2' }, navVersionManagement: { standard: '版本管理', short: '版本' }, navSoftwareProducts: { standard: '軟體產品', short: '軟體' }, navInstallations: { standard: '裝機記錄', short: '裝機' }, navDictionary: { standard: '字典設定', short: '字典' }, navData: { standard: '資料管理', short: '資料' }, navGuidelines: { standard: '設計規範', short: '規範' }, navInteractionSpecs: { standard: '互動規範', short: '互動' }, dataFieldDictionary: { standard: '欄位字典', short: '字典' }, dataTemplates: { standard: '構型範本', short: '範本' }, dataParameters: { standard: '參數定義', short: '參數' }, platformSubtitle: { standard: '軟體管理與授權平臺', short: '管理與授權平臺' }, editorNavigation: { standard: '編輯器模組切換' },
    customHomepage: { standard: '自訂首頁', short: '首頁' }, schemes: { standard: '個方案' }, selectScheme: { standard: '選擇首頁方案：' }, updated: { standard: '更新' }, moreActions: { standard: '更多操作' }, rename: { standard: '重新命名' }, copyScheme: { standard: '複製方案', short: '複製' }, exportHomepage: { standard: '匯出首頁', short: '匯出' }, deleteHomepage: { standard: '刪除首頁', short: '刪除' }, noMatchingHomepage: { standard: '未找到相符的首頁', short: '無相符首頁' }, componentManagement: { standard: '元件管理', short: '元件' }, addHomepage: { standard: '新增首頁', short: '新增' }, renamePanel: { standard: '重新命名面板', short: '重新命名' }, cancel: { standard: '取消' }, confirm: { standard: '確認' }, homepageNamePlaceholder: { standard: '請輸入首頁名稱', short: '首頁名稱' }, compositeRobot: { standard: 'MCR複合機器人', short: 'MCR' }, agvRobot: { standard: 'AGV搬運機器人', short: 'AGV' }, inspectionRobot: { standard: '巡檢機器人', short: '巡檢' }, customHomepageSuffix: { standard: '自訂首頁-01', short: '首頁-01' }, homepageDescription: { standard: '根據現場任務和設備狀態搭建首頁', short: '按任務和設備狀態搭建首頁' }, delete: { standard: '刪除' }, exportPanel: { standard: '匯出面板', short: '匯出' }, editPanel: { standard: '編輯面板', short: '編輯' }, homepage: { standard: '首頁' },
  },
};

type LegacyTerms = Record<Exclude<AppLocale, 'zh-Hans'>, Record<string, string>>;

// Compatibility glossary for older product pages that still contain literal Simplified Chinese UI copy.
// Exact phrases win; the longest matching domain terms are then replaced. Identifiers and unknown user data stay untouched.
const LEGACY_UI_TERMS: LegacyTerms = {
  en: {
    '软件管理与授权平台': 'Software Management & Licensing', '机器人组件库': 'Robot Component Library', '机器人型号管理': 'Robot Model Management',
    '产品版本管理': 'Product Version Management', '软件产品管理': 'Software Product Management', '装机记录管理': 'Installation Records',
    '智能制造系统': 'Smart Manufacturing System', '工单管理': 'Work Order Management', '设计规范': 'Design Guidelines', '交互规范': 'Interaction Guidelines',
    '字段字典': 'Field Dictionary', '构型模板': 'Configuration Templates', '参数定义': 'Parameter Definitions', '数据管理': 'Data Management',
    '型号模板': 'Model Templates', '组件库分类': 'Component Categories', '型号模板分类': 'Model Categories', '项目扩展属性': 'Project Extensions',
    '创建机器人型号': 'Create Robot Model', '新增机器人型号': 'Add Robot Model', '编辑机器人型号': 'Edit Robot Model', '删除机器人型号': 'Delete Robot Model',
    '新增软件产品': 'Add Software Product', '编辑软件产品': 'Edit Software Product', '删除软件产品': 'Delete Software Product',
    '新增装机记录': 'Add Installation Record', '编辑装机记录': 'Edit Installation Record', '删除装机记录': 'Delete Installation Record',
    '新增产品版本': 'Add Product Version', '编辑产品版本': 'Edit Product Version', '删除产品版本': 'Delete Product Version',
    '新增构型模板': 'Add Configuration Template', '编辑构型模板': 'Edit Configuration Template', '新增参数': 'Add Parameter', '编辑参数': 'Edit Parameter',
    '新增工单': 'Add Work Order', '编辑工单': 'Edit Work Order', '删除工单': 'Delete Work Order', '创建工单': 'Create Work Order',
    '搜索产品名称、标识码': 'Search product name or identifier', '搜索名称、编码或描述': 'Search name, code, or description',
    '请输入搜索内容': 'Enter search terms', '请输入名称': 'Enter a name', '请输入描述': 'Enter a description', '请选择状态': 'Select status',
    '暂无数据': 'No data', '暂无记录': 'No records', '暂无搜索结果': 'No results', '加载中': 'Loading', '操作成功': 'Operation successful',
    '确认删除': 'Confirm deletion', '删除操作不可撤销': 'This action cannot be undone', '保存并提交': 'Save & submit', '保存修改': 'Save changes',
    '批量导入': 'Bulk import', '导入配置': 'Import configuration', '导出配置': 'Export configuration', '导出数据': 'Export data',
    '基础信息': 'Basic information', '版本信息': 'Version information', '配置参数': 'Configuration parameters', '关联组件': 'Related components',
    '型号名称': 'Model name', '型号编码': 'Model code', '产品名称': 'Product name', '产品标识码': 'Product identifier', '版本名称': 'Version name',
    '版本号': 'Version', '软件包': 'Software package', '安装时间': 'Installation time', '安装位置': 'Installation location', '负责人': 'Owner',
    '创建时间': 'Created at', '更新时间': 'Updated at', '发布时间': 'Released at', '最后更新': 'Last updated', '备注': 'Notes',
    '启用状态': 'Enabled status', '已启用': 'Enabled', '未启用': 'Disabled', '已停用': 'Disabled', '已发布': 'Published', '未发布': 'Unpublished',
    '草稿': 'Draft', '进行中': 'In progress', '已完成': 'Completed', '已取消': 'Cancelled', '待处理': 'Pending', '失败': 'Failed', '成功': 'Success',
    '名称': 'Name', '编码': 'Code', '描述': 'Description', '类型': 'Type', '分类': 'Category', '状态': 'Status', '操作': 'Actions',
    '搜索': 'Search', '筛选': 'Filter', '重置': 'Reset', '新增': 'Add', '创建': 'Create', '编辑': 'Edit', '删除': 'Delete', '复制': 'Duplicate',
    '导入': 'Import', '导出': 'Export', '下载': 'Download', '上传': 'Upload', '预览': 'Preview', '详情': 'Details', '查看': 'View',
    '保存': 'Save', '取消': 'Cancel', '确认': 'Confirm', '关闭': 'Close', '返回': 'Back', '下一步': 'Next', '上一步': 'Previous',
    '全选': 'Select all', '更多操作': 'More actions', '刷新': 'Refresh', '设置': 'Settings', '通知': 'Notifications', '首页': 'Home',
    '组件': 'Component', '机器人': 'Robot', '机械臂': 'Robot arm', '底盘': 'Chassis', '自由度': 'Degrees of freedom', '规格': 'Specification',
    '装配模板': 'Assembly Template', '槽位规则': 'Slot Rules', '运动链槽位': 'Kinematic Chain Slots', '类型级槽位规则': 'Type-level Slot Rules',
    '构型名称': 'Configuration name', '启用构型': 'Enable configuration', '恢复默认': 'Restore defaults', '全部规格': 'All specifications',
    '字段名称': 'Field name', '显示名称': 'Display name', '所属组件': 'Component', '组件类型': 'Component type', '数据类型': 'Data type',
    '默认值': 'Default value', '枚举项': 'Options', '新增字段': 'Add field', '新增枚举项': 'Add option', '启用字段': 'Enable field',
    '参数分类': 'Parameter category', '整型': 'Integer', '浮点型': 'Decimal', '文本型': 'Text', '枚举型': 'Enumeration',
    '模型结构': 'Model Structure', '素材库': 'Asset Library', '关节控制': 'Joint Controls', '实时关节接口': 'Live Joint Interface',
    '导入 URDF': 'Import URDF', '导出 URDF': 'Export URDF', '上传模型素材': 'Upload Model Asset', '上传 Mesh': 'Upload Mesh',
    '新增结构节点': 'Add Structure Node', '暂无模型结构': 'No model structure', '暂无模型素材': 'No model assets', '物理属性': 'Physical Properties',
    '可视化': 'Visual', '碰撞体': 'Collision', '惯性参考系': 'Inertial Frame', '惯性张量': 'Inertia Tensor', '质量与质心': 'Mass & Center of Mass',
    '几何资源': 'Geometry Asset', '几何类型': 'Geometry Type', '模型旋转': 'Model Rotation', '旋转姿态': 'Rotation', '派生参数': 'Derived Parameters',
    '显示网格': 'Show Mesh', '显示碰撞体': 'Show Collisions', '全部关节归零': 'Zero All Joints', '获取状态': 'Fetch Status', '持续同步': 'Continuous Sync',
    '项目编号': 'Project ID', '项目名称': 'Project name', '机器人编号': 'Robot ID', '机器人 IP': 'Robot IP', '软件出库时间': 'Software release time',
    '安装状态': 'Installation status', '已安装软件': 'Installed software', '未安装软件': 'Not installed', '装机备注': 'Installation notes', '操作人': 'Operator',
    '查看详情': 'View details', '编辑记录': 'Edit record', '装机详情': 'Installation details', '操作记录': 'Activity log', '流程编号': 'Process ID',
    '产品目录': 'Product Catalog', '产品分组': 'Product Group', '产品类型': 'Product Type', '产品描述': 'Product description', '产品标识符': 'Product identifier',
    '发布新版本': 'Release New Version', '发布说明': 'Release notes', '安装包': 'Installation package', '文件大小': 'File size', '架构': 'Architecture',
    '正式发布版本': 'Production Release', '正式版': 'Stable', '测试包': 'Test package', '关联软件': 'Related software', '一键发版': 'Quick release',
    '工作台管理': 'Workstation Management', '工装管理': 'Tooling Management', '基础数据管理': 'Master Data Management', '系统配置': 'System Settings',
    '工单编号': 'Work Order ID', '工单名称': 'Work Order name', '生产计划': 'Production Plan', '计划数量': 'Planned quantity', '完成数量': 'Completed quantity',
    '优先级': 'Priority', '开始时间': 'Start time', '结束时间': 'End time', '生产状态': 'Production status', '生产线': 'Production line',
  },
  ms: {
    '软件管理与授权平台':'Pengurusan Perisian & Pelesenan','机器人组件库':'Pustaka Komponen Robot','机器人型号管理':'Pengurusan Model Robot','产品版本管理':'Pengurusan Versi Produk','软件产品管理':'Pengurusan Produk Perisian','装机记录管理':'Rekod Pemasangan','智能制造系统':'Sistem Pembuatan Pintar','工单管理':'Pengurusan Pesanan Kerja','设计规范':'Garis Panduan Reka Bentuk','交互规范':'Garis Panduan Interaksi','字段字典':'Kamus Medan','构型模板':'Templat Konfigurasi','参数定义':'Definisi Parameter','数据管理':'Pengurusan Data','型号模板':'Templat Model','创建机器人型号':'Cipta Model Robot','新增机器人型号':'Tambah Model Robot','编辑机器人型号':'Edit Model Robot','删除机器人型号':'Padam Model Robot','新增软件产品':'Tambah Produk Perisian','编辑软件产品':'Edit Produk Perisian','新增装机记录':'Tambah Rekod Pemasangan','新增产品版本':'Tambah Versi Produk','新增构型模板':'Tambah Templat Konfigurasi','新增参数':'Tambah Parameter','新增工单':'Tambah Pesanan Kerja','编辑工单':'Edit Pesanan Kerja','删除工单':'Padam Pesanan Kerja','暂无数据':'Tiada data','暂无记录':'Tiada rekod','暂无搜索结果':'Tiada hasil','加载中':'Memuatkan','确认删除':'Sahkan pemadaman','删除操作不可撤销':'Tindakan ini tidak boleh dibuat asal','保存并提交':'Simpan & hantar','保存修改':'Simpan perubahan','基础信息':'Maklumat asas','版本信息':'Maklumat versi','配置参数':'Parameter konfigurasi','型号名称':'Nama model','型号编码':'Kod model','产品名称':'Nama produk','产品标识码':'Pengecam produk','版本名称':'Nama versi','版本号':'Versi','安装时间':'Masa pemasangan','创建时间':'Masa dicipta','更新时间':'Masa dikemas kini','备注':'Catatan','已启用':'Diaktifkan','已停用':'Dilumpuhkan','已发布':'Diterbitkan','草稿':'Draf','进行中':'Sedang berjalan','已完成':'Selesai','已取消':'Dibatalkan','待处理':'Belum selesai','失败':'Gagal','成功':'Berjaya','名称':'Nama','编码':'Kod','描述':'Penerangan','类型':'Jenis','分类':'Kategori','状态':'Status','操作':'Tindakan','搜索':'Cari','筛选':'Tapis','重置':'Tetapkan semula','新增':'Tambah','创建':'Cipta','编辑':'Edit','删除':'Padam','复制':'Salin','导入':'Import','导出':'Eksport','下载':'Muat turun','上传':'Muat naik','预览':'Pratonton','详情':'Butiran','查看':'Lihat','保存':'Simpan','取消':'Batal','确认':'Sahkan','关闭':'Tutup','返回':'Kembali','下一步':'Seterusnya','上一步':'Sebelumnya','全选':'Pilih semua','更多操作':'Tindakan lain','刷新':'Muat semula','设置':'Tetapan','通知':'Pemberitahuan','首页':'Laman Utama','组件':'Komponen','机器人':'Robot','机械臂':'Lengan robot','底盘':'Casis','自由度':'Darjah kebebasan','规格':'Spesifikasi',
  },
  vi: {
    '软件管理与授权平台':'Quản lý phần mềm & cấp phép','机器人组件库':'Thư viện thành phần Robot','机器人型号管理':'Quản lý mô hình Robot','产品版本管理':'Quản lý phiên bản sản phẩm','软件产品管理':'Quản lý sản phẩm phần mềm','装机记录管理':'Lịch sử cài đặt','智能制造系统':'Hệ thống sản xuất thông minh','工单管理':'Quản lý lệnh sản xuất','设计规范':'Hướng dẫn thiết kế','交互规范':'Hướng dẫn tương tác','字段字典':'Từ điển trường','构型模板':'Mẫu cấu hình','参数定义':'Định nghĩa tham số','数据管理':'Quản lý dữ liệu','型号模板':'Mẫu mô hình','创建机器人型号':'Tạo mô hình Robot','新增机器人型号':'Thêm mô hình Robot','编辑机器人型号':'Chỉnh sửa mô hình Robot','删除机器人型号':'Xóa mô hình Robot','新增软件产品':'Thêm sản phẩm phần mềm','编辑软件产品':'Chỉnh sửa sản phẩm phần mềm','新增装机记录':'Thêm bản ghi cài đặt','新增产品版本':'Thêm phiên bản sản phẩm','新增构型模板':'Thêm mẫu cấu hình','新增参数':'Thêm tham số','新增工单':'Thêm lệnh sản xuất','编辑工单':'Chỉnh sửa lệnh sản xuất','删除工单':'Xóa lệnh sản xuất','暂无数据':'Không có dữ liệu','暂无记录':'Không có bản ghi','暂无搜索结果':'Không có kết quả','加载中':'Đang tải','确认删除':'Xác nhận xóa','删除操作不可撤销':'Không thể hoàn tác thao tác này','保存并提交':'Lưu & gửi','保存修改':'Lưu thay đổi','基础信息':'Thông tin cơ bản','版本信息':'Thông tin phiên bản','配置参数':'Tham số cấu hình','型号名称':'Tên mô hình','型号编码':'Mã mô hình','产品名称':'Tên sản phẩm','产品标识码':'Mã định danh sản phẩm','版本名称':'Tên phiên bản','版本号':'Phiên bản','安装时间':'Thời gian cài đặt','创建时间':'Thời gian tạo','更新时间':'Thời gian cập nhật','备注':'Ghi chú','已启用':'Đã bật','已停用':'Đã tắt','已发布':'Đã phát hành','草稿':'Bản nháp','进行中':'Đang thực hiện','已完成':'Hoàn tất','已取消':'Đã hủy','待处理':'Chờ xử lý','失败':'Thất bại','成功':'Thành công','名称':'Tên','编码':'Mã','描述':'Mô tả','类型':'Loại','分类':'Danh mục','状态':'Trạng thái','操作':'Thao tác','搜索':'Tìm kiếm','筛选':'Lọc','重置':'Đặt lại','新增':'Thêm','创建':'Tạo','编辑':'Chỉnh sửa','删除':'Xóa','复制':'Sao chép','导入':'Nhập','导出':'Xuất','下载':'Tải xuống','上传':'Tải lên','预览':'Xem trước','详情':'Chi tiết','查看':'Xem','保存':'Lưu','取消':'Hủy','确认':'Xác nhận','关闭':'Đóng','返回':'Quay lại','下一步':'Tiếp theo','上一步':'Trước','全选':'Chọn tất cả','更多操作':'Thao tác khác','刷新':'Làm mới','设置':'Cài đặt','通知':'Thông báo','首页':'Trang chủ','组件':'Thành phần','机器人':'Robot','机械臂':'Cánh tay robot','底盘':'Khung gầm','自由度':'Bậc tự do','规格':'Thông số',
  },
  'zh-Hant': {
    '软件管理与授权平台':'軟體管理與授權平臺','机器人组件库':'機器人元件庫','机器人型号管理':'機器人型號管理','产品版本管理':'產品版本管理','软件产品管理':'軟體產品管理','装机记录管理':'裝機記錄管理','智能制造系统':'智慧製造系統','工单管理':'工單管理','设计规范':'設計規範','交互规范':'互動規範','字段字典':'欄位字典','构型模板':'構型範本','参数定义':'參數定義','数据管理':'資料管理','型号模板':'型號範本','创建机器人型号':'建立機器人型號','新增机器人型号':'新增機器人型號','编辑机器人型号':'編輯機器人型號','删除机器人型号':'刪除機器人型號','新增软件产品':'新增軟體產品','编辑软件产品':'編輯軟體產品','新增装机记录':'新增裝機記錄','新增产品版本':'新增產品版本','新增构型模板':'新增構型範本','新增参数':'新增參數','新增工单':'新增工單','编辑工单':'編輯工單','删除工单':'刪除工單','暂无数据':'暫無資料','暂无记录':'暫無記錄','暂无搜索结果':'暫無搜尋結果','加载中':'載入中','确认删除':'確認刪除','删除操作不可撤销':'刪除操作不可復原','保存并提交':'儲存並提交','保存修改':'儲存修改','基础信息':'基礎資訊','版本信息':'版本資訊','配置参数':'設定參數','型号名称':'型號名稱','型号编码':'型號編碼','产品名称':'產品名稱','产品标识码':'產品識別碼','版本名称':'版本名稱','版本号':'版本號','安装时间':'安裝時間','创建时间':'建立時間','更新时间':'更新時間','备注':'備註','已启用':'已啟用','已停用':'已停用','已发布':'已發佈','草稿':'草稿','进行中':'進行中','已完成':'已完成','已取消':'已取消','待处理':'待處理','失败':'失敗','成功':'成功','名称':'名稱','编码':'編碼','描述':'描述','类型':'類型','分类':'分類','状态':'狀態','操作':'操作','搜索':'搜尋','筛选':'篩選','重置':'重設','新增':'新增','创建':'建立','编辑':'編輯','删除':'刪除','复制':'複製','导入':'匯入','导出':'匯出','下载':'下載','上传':'上傳','预览':'預覽','详情':'詳情','查看':'查看','保存':'儲存','取消':'取消','确认':'確認','关闭':'關閉','返回':'返回','下一步':'下一步','上一步':'上一步','全选':'全選','更多操作':'更多操作','刷新':'重新整理','设置':'設定','通知':'通知','首页':'首頁','组件':'元件','机器人':'機器人','机械臂':'機械臂','底盘':'底盤','自由度':'自由度','规格':'規格',
  },
};

const INTERACTION_UI_TERMS: LegacyTerms = {
  en: {
    '交互规范目录':'Interaction guidelines directory','状态模型':'State model','鼠标与触控':'Mouse and touch','键盘与快捷键':'Keyboard and shortcuts','Focus 与焦点管理':'Focus management','点击、选择与切换':'Activation, selection and toggles','筛选与排序':'Filtering and sorting','表单输入与校验':'Form input and validation','异步操作':'Async operations','删除与危险操作':'Deletion and dangerous actions','滚动与溢出':'Scrolling and overflow','拖拽':'Drag and drop','上传与文件操作':'Uploads and file operations','Undo / Redo 与未保存状态':'Undo / Redo and unsaved changes','动效':'Motion','响应式与触屏':'Responsive and touch','权限、占用与不可用状态':'Permissions, occupancy and unavailable states','导航与返回逻辑':'Navigation and back behavior','导航、历史状态与列表上下文':'Navigation, history and list context','右键与上下文菜单':'Right-click and context menus','行内编辑 Inline Edit':'Inline editing','多选与范围选择':'Multi-select and range selection','自动保存与保存状态':'Autosave and save status','版本与并发冲突':'Version and concurrency conflicts','实时数据刷新':'Real-time data refresh','断线与重连':'Disconnection and reconnection','路由与深链接':'Routing and deep links','Command / 快捷操作':'Command and quick actions','操作打断':'Operation interruption','Session / 超时':'Session and timeout','乐观更新 Optimistic UI':'Optimistic UI','批处理执行反馈':'Batch execution feedback','任务队列':'Task queue','进度与取消':'Progress and cancellation','页面刷新与数据恢复':'Page reload and data recovery','帮助与解释交互':'Help and explanatory interactions','系统级通知':'System notifications','可访问动态反馈':'Accessible live feedback','输入法与组合输入':'IME and composition input','数据刷新与用户编辑冲突':'Data refresh and editing conflicts','恢复与逃生路径':'Recovery and escape paths','无障碍交互':'Accessible interaction','规则求值与冲突处理':'Rule evaluation and conflict handling','文档规则':'Document rules','以下内容直接读取 docs/ui-guidelines.md 的对应章节。':'The following content is read directly from the corresponding section of docs/ui-guidelines.md.','交互示范':'Interaction example','正确做法':'Recommended','避免':'Avoid',
  },
  ms: {
    '交互规范目录':'Direktori garis panduan interaksi','状态模型':'Model keadaan','鼠标与触控':'Tetikus dan sentuhan','键盘与快捷键':'Papan kekunci dan pintasan','Focus 与焦点管理':'Pengurusan fokus','点击、选择与切换':'Pengaktifan, pemilihan dan togol','筛选与排序':'Penapisan dan pengisihan','表单输入与校验':'Input dan pengesahan borang','异步操作':'Operasi tak segerak','删除与危险操作':'Pemadaman dan tindakan berbahaya','滚动与溢出':'Tatal dan limpahan','拖拽':'Seret dan lepas','上传与文件操作':'Muat naik dan operasi fail','Undo / Redo 与未保存状态':'Buat asal / Buat semula dan perubahan belum disimpan','动效':'Gerakan','响应式与触屏':'Responsif dan sentuhan','权限、占用与不可用状态':'Kebenaran, penggunaan dan keadaan tidak tersedia','导航与返回逻辑':'Navigasi dan tingkah laku kembali','导航、历史状态与列表上下文':'Navigasi, sejarah dan konteks senarai','右键与上下文菜单':'Klik kanan dan menu konteks','行内编辑 Inline Edit':'Penyuntingan sebaris','多选与范围选择':'Berbilang pilihan dan pemilihan julat','自动保存与保存状态':'Simpan automatik dan status simpan','版本与并发冲突':'Konflik versi dan serentak','实时数据刷新':'Muat semula data masa nyata','断线与重连':'Terputus dan sambung semula','路由与深链接':'Penghalaan dan pautan dalam','Command / 快捷操作':'Perintah dan tindakan pantas','操作打断':'Gangguan operasi','Session / 超时':'Sesi dan tamat masa','乐观更新 Optimistic UI':'UI optimistik','批处理执行反馈':'Maklum balas pelaksanaan kelompok','任务队列':'Baris gilir tugas','进度与取消':'Kemajuan dan pembatalan','页面刷新与数据恢复':'Muat semula halaman dan pemulihan data','帮助与解释交互':'Bantuan dan interaksi penerangan','系统级通知':'Pemberitahuan sistem','可访问动态反馈':'Maklum balas langsung boleh akses','输入法与组合输入':'IME dan input komposisi','数据刷新与用户编辑冲突':'Konflik muat semula data dan suntingan','恢复与逃生路径':'Laluan pemulihan dan keluar','无障碍交互':'Interaksi boleh akses','规则求值与冲突处理':'Penilaian peraturan dan pengendalian konflik','文档规则':'Peraturan dokumen','以下内容直接读取 docs/ui-guidelines.md 的对应章节。':'Kandungan berikut dibaca terus daripada bahagian yang sepadan dalam docs/ui-guidelines.md.','交互示范':'Contoh interaksi','正确做法':'Disyorkan','避免':'Elakkan',
  },
  vi: {
    '交互规范目录':'Mục lục hướng dẫn tương tác','状态模型':'Mô hình trạng thái','鼠标与触控':'Chuột và cảm ứng','键盘与快捷键':'Bàn phím và phím tắt','Focus 与焦点管理':'Quản lý tiêu điểm','点击、选择与切换':'Kích hoạt, lựa chọn và chuyển đổi','筛选与排序':'Lọc và sắp xếp','表单输入与校验':'Nhập và xác thực biểu mẫu','异步操作':'Thao tác bất đồng bộ','删除与危险操作':'Xóa và thao tác nguy hiểm','滚动与溢出':'Cuộn và tràn nội dung','拖拽':'Kéo và thả','上传与文件操作':'Tải lên và thao tác tệp','Undo / Redo 与未保存状态':'Hoàn tác / Làm lại và thay đổi chưa lưu','动效':'Chuyển động','响应式与触屏':'Thích ứng và cảm ứng','权限、占用与不可用状态':'Quyền, trạng thái đang dùng và không khả dụng','导航与返回逻辑':'Điều hướng và hành vi quay lại','导航、历史状态与列表上下文':'Điều hướng, lịch sử và ngữ cảnh danh sách','右键与上下文菜单':'Nhấp phải và menu ngữ cảnh','行内编辑 Inline Edit':'Chỉnh sửa nội tuyến','多选与范围选择':'Đa lựa chọn và chọn phạm vi','自动保存与保存状态':'Tự động lưu và trạng thái lưu','版本与并发冲突':'Xung đột phiên bản và đồng thời','实时数据刷新':'Làm mới dữ liệu thời gian thực','断线与重连':'Mất kết nối và kết nối lại','路由与深链接':'Định tuyến và liên kết sâu','Command / 快捷操作':'Lệnh và thao tác nhanh','操作打断':'Gián đoạn thao tác','Session / 超时':'Phiên và hết thời gian','乐观更新 Optimistic UI':'Giao diện cập nhật lạc quan','批处理执行反馈':'Phản hồi thực thi hàng loạt','任务队列':'Hàng đợi tác vụ','进度与取消':'Tiến độ và hủy','页面刷新与数据恢复':'Tải lại trang và khôi phục dữ liệu','帮助与解释交互':'Trợ giúp và tương tác giải thích','系统级通知':'Thông báo hệ thống','可访问动态反馈':'Phản hồi trực tiếp có thể truy cập','输入法与组合输入':'IME và nhập tổ hợp','数据刷新与用户编辑冲突':'Xung đột làm mới dữ liệu và chỉnh sửa','恢复与逃生路径':'Đường khôi phục và thoát','无障碍交互':'Tương tác hỗ trợ tiếp cận','规则求值与冲突处理':'Đánh giá quy tắc và xử lý xung đột','文档规则':'Quy tắc tài liệu','以下内容直接读取 docs/ui-guidelines.md 的对应章节。':'Nội dung sau được đọc trực tiếp từ phần tương ứng trong docs/ui-guidelines.md.','交互示范':'Ví dụ tương tác','正确做法':'Khuyến nghị','避免':'Tránh',
  },
  'zh-Hant': {
    '交互规范目录':'互動規範目錄','状态模型':'狀態模型','鼠标与触控':'滑鼠與觸控','键盘与快捷键':'鍵盤與快捷鍵','Focus 与焦点管理':'Focus 與焦點管理','点击、选择与切换':'點擊、選擇與切換','筛选与排序':'篩選與排序','表单输入与校验':'表單輸入與校驗','异步操作':'非同步操作','删除与危险操作':'刪除與危險操作','滚动与溢出':'捲動與溢出','拖拽':'拖曳','上传与文件操作':'上傳與檔案操作','Undo / Redo 与未保存状态':'Undo / Redo 與未儲存狀態','动效':'動效','响应式与触屏':'響應式與觸控螢幕','权限、占用与不可用状态':'權限、佔用與不可用狀態','导航与返回逻辑':'導航與返回邏輯','导航、历史状态与列表上下文':'導航、歷史狀態與列表上下文','右键与上下文菜单':'右鍵與上下文選單','行内编辑 Inline Edit':'行內編輯 Inline Edit','多选与范围选择':'多選與範圍選擇','自动保存与保存状态':'自動儲存與儲存狀態','版本与并发冲突':'版本與並行衝突','实时数据刷新':'即時資料重新整理','断线与重连':'斷線與重新連線','路由与深链接':'路由與深層連結','Command / 快捷操作':'Command / 快捷操作','操作打断':'操作中斷','Session / 超时':'Session / 逾時','乐观更新 Optimistic UI':'樂觀更新 Optimistic UI','批处理执行反馈':'批次處理執行回饋','任务队列':'任務佇列','进度与取消':'進度與取消','页面刷新与数据恢复':'頁面重新整理與資料恢復','帮助与解释交互':'幫助與解釋互動','系统级通知':'系統級通知','可访问动态反馈':'可存取動態回饋','输入法与组合输入':'輸入法與組合輸入','数据刷新与用户编辑冲突':'資料重新整理與使用者編輯衝突','恢复与逃生路径':'恢復與逃生路徑','无障碍交互':'無障礙互動','规则求值与冲突处理':'規則求值與衝突處理','文档规则':'文件規則','以下内容直接读取 docs/ui-guidelines.md 的对应章节。':'以下內容直接讀取 docs/ui-guidelines.md 的對應章節。','交互示范':'互動示範','正确做法':'正確做法','避免':'避免',
  },
};

function translateLegacyText(text: string, locale: AppLocale) {
  if (locale === 'zh-Hans' || !/[\u4e00-\u9fff]/.test(text)) return text;
  const terms = { ...LEGACY_UI_TERMS[locale], ...INTERACTION_UI_TERMS[locale] };
  const source = text.trim();
  const translated = terms[source];
  if (!translated) return text;
  const start = text.indexOf(source);
  return `${text.slice(0, start)}${translated}${text.slice(start + source.length)}`;
}

const legacyTextSources = new WeakMap<Text, string>();

function LegacyUiLocalizer({ locale }: { locale: AppLocale }) {
  useLayoutEffect(() => {
    const attributeNames = ['placeholder', 'title', 'aria-label'] as const;
    let applying = false;

    const localizeText = (node: Text) => {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, code, pre, [data-i18n-skip]')) return;
      const current = node.nodeValue ?? '';
      const previous = legacyTextSources.get(node);
      if (previous && !/[\u4e00-\u9fff]/.test(current)) {
        const isLegacyOutput = current === previous || (Object.keys(LEGACY_UI_TERMS) as Array<Exclude<AppLocale, 'zh-Hans'>>)
          .some(candidate => translateLegacyText(previous, candidate) === current);
        // A formally localized React node owns its own copy. Never replace it with
        // the compatibility translation remembered from an earlier render.
        if (!isLegacyOutput) {
          legacyTextSources.delete(node);
          return;
        }
      }
      const original = !previous || /[\u4e00-\u9fff]/.test(current) ? current : previous;
      if (original !== previous) legacyTextSources.set(node, original);
      const next = translateLegacyText(original, locale);
      if (node.nodeValue !== next) node.nodeValue = next;
    };

    const localizeElement = (element: Element) => {
      if (element.closest('script, style, code, pre, [data-i18n-skip]')) return;
      for (const name of attributeNames) {
        const value = element.getAttribute(name);
        if (!value) continue;
        const sourceName = `data-i18n-source-${name}`;
        let original = element.getAttribute(sourceName) ?? value;
        if (original !== value && /[\u4e00-\u9fff]/.test(original) && !/[\u4e00-\u9fff]/.test(value)) {
          const isLegacyOutput = (Object.keys(LEGACY_UI_TERMS) as Array<Exclude<AppLocale, 'zh-Hans'>>)
            .some(candidate => translateLegacyText(original, candidate) === value);
          if (!isLegacyOutput) {
            element.setAttribute(sourceName, value);
            original = value;
          }
        }
        if (!element.hasAttribute(sourceName)) element.setAttribute(sourceName, original);
        const next = translateLegacyText(original, locale);
        if (value !== next) element.setAttribute(name, next);
      }
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) { localizeText(node as Text); node = walker.nextNode(); }
    };

    const apply = (root: Node = document.body) => {
      if (applying) return;
      applying = true;
      if (root.nodeType === Node.TEXT_NODE) localizeText(root as Text);
      else if (root instanceof Element) localizeElement(root);
      applying = false;
    };

    apply();
    const observer = new MutationObserver(records => {
      if (applying) return;
      for (const record of records) {
        if (record.type === 'characterData') apply(record.target);
        for (const node of record.addedNodes) apply(node);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);
  return null;
}

function readInitialLocale(): AppLocale {
  if (typeof window === 'undefined') return 'zh-Hans';
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'zh-Hans' || stored === 'en' || stored === 'ms' || stored === 'vi' || stored === 'zh-Hant') return stored;
  const browserLocale = window.navigator.language.toLowerCase();
  if (browserLocale.startsWith('ms')) return 'ms';
  if (browserLocale.startsWith('vi')) return 'vi';
  if (browserLocale.includes('hant') || browserLocale === 'zh-tw' || browserLocale === 'zh-hk') return 'zh-Hant';
  if (browserLocale.startsWith('zh')) return 'zh-Hans';
  return 'en';
}

type I18nContextValue = { locale: AppLocale; setLocale: (locale: AppLocale) => void; copy: (key: string) => Copy; t: (key: string, variant?: 'standard' | 'short') => string };
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(readInitialLocale);
  const setLocale = (next: AppLocale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  };
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const copy = (key: string): Copy => productUiDictionaries[locale][key] ?? dictionaries[locale][key] ?? productUiDictionaries.en[key] ?? dictionaries.en[key] ?? { standard: key };
  const t = (key: string, variant: 'standard' | 'short' = 'standard') => {
    const value = copy(key);
    return variant === 'short' ? value.short ?? value.standard : value.standard;
  };
  return <I18nContext.Provider value={{ locale, setLocale, copy, t }}><LegacyUiLocalizer locale={locale} />{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  return (
    <label title="Language" style={{ height: 36, minWidth: compact ? 76 : 142, padding: '0 9px', display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--app-border)', borderRadius: 8, background: 'var(--app-surface)', color: 'var(--app-text)', flexShrink: 0 }}>
      <Languages size={15} aria-hidden="true" />
      <select aria-label="Language" value={locale} onChange={event => setLocale(event.target.value as AppLocale)} style={{ minWidth: 0, width: '100%', height: 34, border: 0, outline: 0, background: 'transparent', color: 'var(--app-heading)', font: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        {LANGUAGE_OPTIONS.map(option => <option key={option.value} value={option.value}>{compact ? option.short : option.label}</option>)}
      </select>
    </label>
  );
}

export function AdaptiveText({ copy, className, style }: { copy: Copy; className?: string; style?: CSSProperties }) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [short, setShort] = useState(false);
  useLayoutEffect(() => {
    const host = hostRef.current;
    const measure = measureRef.current;
    if (!host || !measure || !copy.short) { setShort(false); return; }
    const update = () => setShort(measure.scrollWidth > host.clientWidth + 1 || measure.scrollHeight > host.clientHeight + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, [copy.standard, copy.short]);
  return (
    <span ref={hostRef} className={className} style={{ ...style, position: 'relative', minWidth: 0 }} title={short ? copy.standard : undefined} data-copy-variant={short ? 'short' : 'standard'}>
      {short && copy.short ? copy.short : copy.standard}
      {copy.short && <span ref={measureRef} aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, display: 'block', width: 'max-content', maxWidth: 'none', height: 'max-content', whiteSpace: 'nowrap', visibility: 'hidden', pointerEvents: 'none' }}>{copy.standard}</span>}
    </span>
  );
}

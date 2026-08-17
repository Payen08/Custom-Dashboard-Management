import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowDownUp, Box, Check, ChevronDown, ChevronRight, CircleDot, Cuboid, Download, Eye, EyeOff,
  FileBox, FileCode2, FileUp, Grid3X3, Image as ImageIcon, Layers3, Link2, Lock,
  Maximize2, MoreHorizontal, Plus, RadioTower, Redo2, Save, Search, Trash2,
  Unlock, Upload, Wifi, WifiOff, X,
} from 'lucide-react';
import type { IndustrialColorTheme, StylePreset, ThemeMode } from '../theme';
import { getRobotThemeVars } from '../theme';
import {
  ProductButton as ArcoButton,
  ProductIconButton as ArcoIconButton,
  ProductIconToggleButton as ArcoIconToggleButton,
  ProductSelect as ArcoSelect,
  ProductTag as ArcoTag,
  ProductTextInput as ArcoTextInput,
} from './ProductUI';
import { MarvinUrdfViewer, type ModelSelectionInfo } from './MarvinUrdfViewer';
import { getLatestArmJointStates } from '../lib/grpcArmJoints';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import '../../styles/business/robot-component-library-2.css';
import '../../styles/business/robot-library-shared.css';
import { AdaptiveText, GLOBAL_ACTION_COPY, useI18n, type AppLocale } from '../i18n';

const ROBOT_LIBRARY_COPY: Record<AppLocale, Record<string, string>> = {
  'zh-Hans': { title:'组件库2', titleShort:'组件2', description:'管理基于 URDF 与 GLB 的机械臂模型、关节和物理属性', descriptionShort:'管理机械臂模型、关节与物理属性', search:'搜索组件名称、模型资源…', create:'新建组件', createShort:'新建', configured:'已配置', model:'Marvin 双臂机器人', modelShort:'Marvin 双臂', modelDescription:'包含双臂 Link / Joint 层级、真实 STL 素材与完整碰撞和惯性配置。', modelDescriptionShort:'双臂层级、STL 素材及物理配置。', nodes:'个结构节点', loaded:'已载入真实模型', edit:'进入编辑', editShort:'编辑' },
  en: { title:'Component Library 2', titleShort:'Components 2', description:'Manage URDF and GLB robot-arm models, joints, and physical properties', descriptionShort:'Manage arm models, joints, and physics', search:'Search', create:'Create component', createShort:'Create', configured:'Configured', model:'Marvin Dual-Arm Robot', modelShort:'Marvin Dual-Arm', modelDescription:'Includes the dual-arm Link / Joint hierarchy, real STL assets, collision geometry, and inertia settings.', modelDescriptionShort:'Dual-arm hierarchy, STL assets, and physics.', nodes:'structure nodes', loaded:'Real model loaded', edit:'Open editor', editShort:'Edit' },
  ms: { title:'Pustaka Komponen 2', titleShort:'Komponen 2', description:'Urus model lengan robot URDF dan GLB, sendi serta sifat fizikal', descriptionShort:'Urus model lengan, sendi dan fizik', search:'Cari komponen atau aset model…', create:'Cipta komponen', createShort:'Cipta', configured:'Dikonfigurasi', model:'Robot Dua Lengan Marvin', modelShort:'Marvin Dua Lengan', modelDescription:'Termasuk hierarki Link / Joint dua lengan, aset STL, geometri pelanggaran dan tetapan inersia.', modelDescriptionShort:'Hierarki dua lengan, aset STL dan fizik.', nodes:'nod struktur', loaded:'Model sebenar dimuatkan', edit:'Buka editor', editShort:'Edit' },
  vi: { title:'Thư viện thành phần 2', titleShort:'Thành phần 2', description:'Quản lý mô hình cánh tay robot URDF và GLB, khớp và thuộc tính vật lý', descriptionShort:'Quản lý mô hình, khớp và vật lý', search:'Tìm thành phần hoặc tài nguyên mô hình…', create:'Tạo thành phần', createShort:'Tạo', configured:'Đã cấu hình', model:'Robot hai tay Marvin', modelShort:'Marvin hai tay', modelDescription:'Bao gồm phân cấp Link / Joint hai tay, tài nguyên STL, hình học va chạm và cấu hình quán tính.', modelDescriptionShort:'Phân cấp hai tay, tài nguyên STL và vật lý.', nodes:'nút cấu trúc', loaded:'Đã tải mô hình thực', edit:'Mở trình chỉnh sửa', editShort:'Chỉnh sửa' },
  'zh-Hant': { title:'元件庫2', titleShort:'元件2', description:'管理基於 URDF 與 GLB 的機械臂模型、關節和物理屬性', descriptionShort:'管理機械臂模型、關節與物理屬性', search:'搜尋元件名稱、模型資源…', create:'新增元件', createShort:'新增', configured:'已設定', model:'Marvin 雙臂機器人', modelShort:'Marvin 雙臂', modelDescription:'包含雙臂 Link / Joint 層級、真實 STL 素材與完整碰撞和慣性設定。', modelDescriptionShort:'雙臂層級、STL 素材及物理設定。', nodes:'個結構節點', loaded:'已載入真實模型', edit:'進入編輯', editShort:'編輯' },
};

const EDITOR_COPY: Record<AppLocale, Record<string, string>> = {
  'zh-Hans': { newComponent:'新建组件', dualArm:'双臂机器人', noUrdf:'尚未导入 URDF', importExport:'导入 / 导出', importUrdf:'导入 URDF', exportUrdf:'导出 URDF', exit:'退出编辑', saved:'已保存', save:'保存配置', assets:'素材库', search:'搜索', uploadAsset:'上传模型素材', searchFiles:'搜索模型文件', addToLink:'添加到当前 Link', deleteAsset:'删除素材', noAssets:'暂无模型素材', assetHelp:'上传 GLB、STL、DAE 或 OBJ 文件', uploadMesh:'上传 Mesh', structure:'模型结构', addNode:'新增结构节点', collapse:'收起', expand:'展开', hidden:'隐藏', locked:'锁定', actions:'操作', hideNode:'隐藏节点', showNode:'显示节点', unlock:'解除锁定', lockNode:'锁定节点', deleteNode:'删除节点', noStructure:'暂无模型结构', structureHelp:'导入 URDF 后自动生成 Link / Joint 层级', joints:'关节控制', jointUnit:'关节角度单位', zero:'全部归零', angle:'角度', currentAngle:'当前角度', noJoints:'暂无可调关节', jointHelp:'导入包含 Joint 的 URDF 后显示控制项', loading:'正在加载完整 Marvin GLB 与关节映射…', loadFailed:'模型加载失败，请检查 GLB 与关节配置', sceneTools:'3D 场景工具', fit:'适应模型', hideGrid:'隐藏网格', showGrid:'显示网格', jointInterface:'关节接口', selected:'3D 选中', vertices:'顶点', materials:'材质', world:'世界坐标', bounds:'包围尺寸', assetPreview:'素材预览', visual:'可视化', collision:'碰撞几何', physics:'物理属性', meshGrid:'Mesh 网格', addMesh:'新增网格', scale:'缩放比例', linkOrigin:'相对于 Link 的原点位置（m）', rotation:'模型旋转', euler:'欧拉角（°）', radian:'弧度（rad）', quaternion:'四元数（XYZ）', material:'材质', color:'颜色', opacity:'透明度', uploadTexture:'上传材质贴图', addCollision:'新增碰撞体', noMesh:'未选择 Mesh', hideCollision:'隐藏碰撞体', showCollision:'显示碰撞体', deleteCollision:'删除碰撞体', geometry:'几何资源', name:'名称', geometryType:'几何类型', selectMesh:'选择 Mesh', collisionFile:'当前 Collision 使用的模型文件', uploadNewMesh:'上传新 Mesh', meshScale:'Mesh 缩放', positionRelative:'相对于 Link 的位置（m）', rotationPose:'旋转姿态', collisionEmpty:'当前 Link 暂无 Collision，请新增碰撞体开始配置。', inertialFrame:'惯性参考系', referenceFrame:'原点参考系', currentReference:'当前参考对象', position:'位置（m）', massCenter:'质量与质心', mass:'质量 Mass（kg）', center:'质心 Center of Mass（m）', inertia:'惯性张量', derived:'派生参数', density:'密度 Density', numeric:'数值或 N/A', moments:'对角惯量', axes:'主轴矩阵', waiting:'等待模型结构', waitingHelp:'导入 URDF 并选择 Link 后，在这里编辑可视化、碰撞几何和物理属性。' },
  en: { newComponent:'New Component', dualArm:'Dual-Arm Robot', noUrdf:'URDF not imported', importExport:'Import / Export', importUrdf:'Import URDF', exportUrdf:'Export URDF', exit:'Exit Editor', saved:'Saved', save:'Save', assets:'Asset Library', search:'Search', uploadAsset:'Upload Model Asset', searchFiles:'Search files', addToLink:'Add to Link', deleteAsset:'Delete Asset', noAssets:'No model assets', assetHelp:'Upload a GLB, STL, DAE, or OBJ file', uploadMesh:'Upload Mesh', structure:'Model Structure', addNode:'Add Structure Node', collapse:'Collapse', expand:'Expand', hidden:'Hidden', locked:'Locked', actions:'Actions', hideNode:'Hide Node', showNode:'Show Node', unlock:'Unlock Node', lockNode:'Lock Node', deleteNode:'Delete Node', noStructure:'No model structure', structureHelp:'Import a URDF to generate the Link / Joint hierarchy', joints:'Joint Controls', jointUnit:'Joint angle unit', zero:'Zero All', angle:'Angle', currentAngle:'Current angle', noJoints:'No adjustable joints', jointHelp:'Import a URDF containing joints to show controls', loading:'Loading the Marvin GLB and joint mapping…', loadFailed:'Model failed to load. Check the GLB and joint mapping.', sceneTools:'3D Scene Tools', fit:'Fit Model', hideGrid:'Hide Grid', showGrid:'Show Grid', jointInterface:'Joint Interface', selected:'3D Selected', vertices:'vertices', materials:'materials', world:'World Position', bounds:'Bounding Size', assetPreview:'Asset Preview', visual:'Visual', collision:'Collision', physics:'Physics', meshGrid:'Meshes', addMesh:'Add Mesh', scale:'Scale', linkOrigin:'Origin relative to Link (m)', rotation:'Model Rotation', euler:'Euler Angles (°)', radian:'Radians (rad)', quaternion:'Quaternion (XYZ)', material:'Material', color:'Color', opacity:'Opacity', uploadTexture:'Upload Texture', addCollision:'Add Collision', noMesh:'No Mesh selected', hideCollision:'Hide Collision', showCollision:'Show Collision', deleteCollision:'Delete Collision', geometry:'Geometry Asset', name:'Name', geometryType:'Geometry Type', selectMesh:'Select Mesh', collisionFile:'Model file used by this Collision', uploadNewMesh:'Upload New Mesh', meshScale:'Mesh Scale', positionRelative:'Position relative to Link (m)', rotationPose:'Rotation', collisionEmpty:'No Collision for this Link. Add one to begin.', inertialFrame:'Inertial Frame', referenceFrame:'Origin Reference', currentReference:'Current Reference', position:'Position (m)', massCenter:'Mass & Center of Mass', mass:'Mass (kg)', center:'Center of Mass (m)', inertia:'Inertia Tensor', derived:'Derived Parameters', density:'Density', numeric:'Number or N/A', moments:'Principal Moments', axes:'Principal Axes', waiting:'Waiting for Model Structure', waitingHelp:'Import a URDF and select a Link to edit Visual, Collision, and Physics properties.' },
  ms: { newComponent:'Komponen Baharu', dualArm:'Robot Dua Lengan', noUrdf:'URDF belum diimport', importExport:'Import / Eksport', importUrdf:'Import URDF', exportUrdf:'Eksport URDF', exit:'Keluar Editor', saved:'Disimpan', save:'Simpan', assets:'Pustaka Aset', search:'Cari', uploadAsset:'Muat Naik Aset Model', searchFiles:'Cari fail', addToLink:'Tambah ke Link', deleteAsset:'Padam Aset', noAssets:'Tiada aset model', assetHelp:'Muat naik fail GLB, STL, DAE atau OBJ', uploadMesh:'Muat Naik Mesh', structure:'Struktur Model', addNode:'Tambah Nod Struktur', collapse:'Tutup', expand:'Buka', hidden:'Tersembunyi', locked:'Dikunci', actions:'Tindakan', hideNode:'Sembunyi Nod', showNode:'Tunjuk Nod', unlock:'Buka Kunci', lockNode:'Kunci Nod', deleteNode:'Padam Nod', noStructure:'Tiada struktur model', structureHelp:'Import URDF untuk menjana hierarki Link / Joint', joints:'Kawalan Sendi', jointUnit:'Unit sudut sendi', zero:'Sifar Semua', angle:'Sudut', currentAngle:'Sudut semasa', noJoints:'Tiada sendi boleh laras', jointHelp:'Import URDF yang mengandungi Joint untuk memaparkan kawalan', loading:'Memuatkan Marvin GLB dan pemetaan sendi…', loadFailed:'Model gagal dimuatkan. Semak GLB dan pemetaan sendi.', sceneTools:'Alat Adegan 3D', fit:'Muat Model', hideGrid:'Sembunyi Grid', showGrid:'Tunjuk Grid', jointInterface:'Antara Muka Sendi', selected:'Dipilih 3D', vertices:'bucu', materials:'bahan', world:'Kedudukan Dunia', bounds:'Saiz Sempadan', assetPreview:'Pratonton Aset', visual:'Visual', collision:'Pelanggaran', physics:'Fizik', meshGrid:'Mesh', addMesh:'Tambah Mesh', scale:'Skala', linkOrigin:'Asal relatif kepada Link (m)', rotation:'Putaran Model', euler:'Sudut Euler (°)', radian:'Radian (rad)', quaternion:'Kuaternion (XYZ)', material:'Bahan', color:'Warna', opacity:'Kelegapan', uploadTexture:'Muat Naik Tekstur', addCollision:'Tambah Pelanggaran', noMesh:'Tiada Mesh dipilih', hideCollision:'Sembunyi Pelanggaran', showCollision:'Tunjuk Pelanggaran', deleteCollision:'Padam Pelanggaran', geometry:'Aset Geometri', name:'Nama', geometryType:'Jenis Geometri', selectMesh:'Pilih Mesh', collisionFile:'Fail model yang digunakan oleh Collision', uploadNewMesh:'Muat Naik Mesh Baharu', meshScale:'Skala Mesh', positionRelative:'Kedudukan relatif kepada Link (m)', rotationPose:'Putaran', collisionEmpty:'Tiada Collision untuk Link ini. Tambah satu untuk bermula.', inertialFrame:'Rangka Inersia', referenceFrame:'Rujukan Asal', currentReference:'Rujukan Semasa', position:'Kedudukan (m)', massCenter:'Jisim & Pusat Jisim', mass:'Jisim (kg)', center:'Pusat Jisim (m)', inertia:'Tensor Inersia', derived:'Parameter Terbitan', density:'Ketumpatan', numeric:'Nombor atau N/A', moments:'Momen Utama', axes:'Paksi Utama', waiting:'Menunggu Struktur Model', waitingHelp:'Import URDF dan pilih Link untuk mengedit sifat Visual, Collision dan Fizik.' },
  vi: { newComponent:'Thành phần mới', dualArm:'Robot hai tay', noUrdf:'Chưa nhập URDF', importExport:'Nhập / Xuất', importUrdf:'Nhập URDF', exportUrdf:'Xuất URDF', exit:'Thoát trình sửa', saved:'Đã lưu', save:'Lưu', assets:'Thư viện tài nguyên', search:'Tìm kiếm', uploadAsset:'Tải tài nguyên mô hình', searchFiles:'Tìm tệp', addToLink:'Thêm vào Link', deleteAsset:'Xóa tài nguyên', noAssets:'Chưa có tài nguyên mô hình', assetHelp:'Tải lên tệp GLB, STL, DAE hoặc OBJ', uploadMesh:'Tải Mesh', structure:'Cấu trúc mô hình', addNode:'Thêm nút cấu trúc', collapse:'Thu gọn', expand:'Mở rộng', hidden:'Đã ẩn', locked:'Đã khóa', actions:'Thao tác', hideNode:'Ẩn nút', showNode:'Hiện nút', unlock:'Mở khóa', lockNode:'Khóa nút', deleteNode:'Xóa nút', noStructure:'Chưa có cấu trúc mô hình', structureHelp:'Nhập URDF để tạo phân cấp Link / Joint', joints:'Điều khiển khớp', jointUnit:'Đơn vị góc khớp', zero:'Đặt về 0', angle:'Góc', currentAngle:'Góc hiện tại', noJoints:'Không có khớp điều chỉnh', jointHelp:'Nhập URDF có Joint để hiển thị điều khiển', loading:'Đang tải Marvin GLB và ánh xạ khớp…', loadFailed:'Không tải được mô hình. Kiểm tra GLB và ánh xạ khớp.', sceneTools:'Công cụ cảnh 3D', fit:'Vừa mô hình', hideGrid:'Ẩn lưới', showGrid:'Hiện lưới', jointInterface:'Giao diện khớp', selected:'Đã chọn 3D', vertices:'đỉnh', materials:'vật liệu', world:'Tọa độ thế giới', bounds:'Kích thước bao', assetPreview:'Xem trước tài nguyên', visual:'Hiển thị', collision:'Va chạm', physics:'Vật lý', meshGrid:'Lưới Mesh', addMesh:'Thêm Mesh', scale:'Tỷ lệ', linkOrigin:'Gốc tương đối với Link (m)', rotation:'Xoay mô hình', euler:'Góc Euler (°)', radian:'Radian (rad)', quaternion:'Quaternion (XYZ)', material:'Vật liệu', color:'Màu', opacity:'Độ mờ', uploadTexture:'Tải họa tiết', addCollision:'Thêm va chạm', noMesh:'Chưa chọn Mesh', hideCollision:'Ẩn va chạm', showCollision:'Hiện va chạm', deleteCollision:'Xóa va chạm', geometry:'Tài nguyên hình học', name:'Tên', geometryType:'Loại hình học', selectMesh:'Chọn Mesh', collisionFile:'Tệp mô hình dùng cho Collision', uploadNewMesh:'Tải Mesh mới', meshScale:'Tỷ lệ Mesh', positionRelative:'Vị trí tương đối với Link (m)', rotationPose:'Tư thế xoay', collisionEmpty:'Link này chưa có Collision. Hãy thêm để bắt đầu.', inertialFrame:'Hệ quy chiếu quán tính', referenceFrame:'Tham chiếu gốc', currentReference:'Tham chiếu hiện tại', position:'Vị trí (m)', massCenter:'Khối lượng & tâm khối', mass:'Khối lượng (kg)', center:'Tâm khối (m)', inertia:'Tensor quán tính', derived:'Tham số suy ra', density:'Mật độ', numeric:'Số hoặc N/A', moments:'Mô-men chính', axes:'Trục chính', waiting:'Đang chờ cấu trúc mô hình', waitingHelp:'Nhập URDF và chọn Link để chỉnh thuộc tính Hiển thị, Va chạm và Vật lý.' },
  'zh-Hant': { newComponent:'新增元件', dualArm:'雙臂機器人', noUrdf:'尚未匯入 URDF', importExport:'匯入 / 匯出', importUrdf:'匯入 URDF', exportUrdf:'匯出 URDF', exit:'退出編輯', saved:'已儲存', save:'儲存設定', assets:'素材庫', search:'搜尋', uploadAsset:'上傳模型素材', searchFiles:'搜尋模型檔案', addToLink:'新增至目前 Link', deleteAsset:'刪除素材', noAssets:'暫無模型素材', assetHelp:'上傳 GLB、STL、DAE 或 OBJ 檔案', uploadMesh:'上傳 Mesh', structure:'模型結構', addNode:'新增結構節點', collapse:'收合', expand:'展開', hidden:'隱藏', locked:'鎖定', actions:'操作', hideNode:'隱藏節點', showNode:'顯示節點', unlock:'解除鎖定', lockNode:'鎖定節點', deleteNode:'刪除節點', noStructure:'暫無模型結構', structureHelp:'匯入 URDF 後自動產生 Link / Joint 層級', joints:'關節控制', jointUnit:'關節角度單位', zero:'全部歸零', angle:'角度', currentAngle:'目前角度', noJoints:'暫無可調關節', jointHelp:'匯入包含 Joint 的 URDF 後顯示控制項', loading:'正在載入完整 Marvin GLB 與關節映射…', loadFailed:'模型載入失敗，請檢查 GLB 與關節設定', sceneTools:'3D 場景工具', fit:'適應模型', hideGrid:'隱藏網格', showGrid:'顯示網格', jointInterface:'關節介面', selected:'3D 選中', vertices:'頂點', materials:'材質', world:'世界座標', bounds:'包圍尺寸', assetPreview:'素材預覽', visual:'視覺', collision:'碰撞', physics:'物理屬性', meshGrid:'Mesh 網格', addMesh:'新增網格', scale:'縮放比例', linkOrigin:'相對於 Link 的原點位置（m）', rotation:'模型旋轉', euler:'歐拉角（°）', radian:'弧度（rad）', quaternion:'四元數（XYZ）', material:'材質', color:'顏色', opacity:'透明度', uploadTexture:'上傳材質貼圖', addCollision:'新增碰撞體', noMesh:'未選擇 Mesh', hideCollision:'隱藏碰撞體', showCollision:'顯示碰撞體', deleteCollision:'刪除碰撞體', geometry:'幾何資源', name:'名稱', geometryType:'幾何類型', selectMesh:'選擇 Mesh', collisionFile:'目前 Collision 使用的模型檔案', uploadNewMesh:'上傳新 Mesh', meshScale:'Mesh 縮放', positionRelative:'相對於 Link 的位置（m）', rotationPose:'旋轉姿態', collisionEmpty:'目前 Link 暫無 Collision，請新增碰撞體開始設定。', inertialFrame:'慣性參考系', referenceFrame:'原點參考系', currentReference:'目前參考物件', position:'位置（m）', massCenter:'質量與質心', mass:'質量 Mass（kg）', center:'質心 Center of Mass（m）', inertia:'慣性張量', derived:'派生參數', density:'密度 Density', numeric:'數值或 N/A', moments:'對角慣量', axes:'主軸矩陣', waiting:'等待模型結構', waitingHelp:'匯入 URDF 並選擇 Link 後，在這裡編輯視覺、碰撞與物理屬性。' },
};

const EDITOR_EXTRA_COPY: Record<AppLocale, Record<string, string>> = {
  'zh-Hans': { liveInterface:'实时关节接口', closePanel:'关闭接口面板', gateway:'gRPC-Web 网关', deviceAddress:'http://设备地址:端口', armScope:'机械臂范围', bothArms:'双臂（0 + 1）', leftArm:'左臂（0）', rightArm:'右臂（1）', getStatus:'获取状态', stopSync:'停止同步', keepSync:'持续同步', notConnected:'未连接', fetching:'正在获取关节状态…', synced:'已同步 {count} 个关节', connectionFailed:'接口连接失败', viewSwitch:'三维视角切换', isoView:'等轴测视角', axisView:'{axis} 轴视角', switchTo:'切换到 {view}', step:'第 {step} 步', startUrdf:'从导入 URDF 开始', addMeshNext:'结构已生成，继续添加 Mesh', resourcesReady:'基础资源已准备完成', urdfHelp:'系统将解析机器人名称、Link、Joint 和层级关系，不会预置示例数据。', meshHelp:'已解析 {links} 个 Link 和 {joints} 个 Joint。现在关联网格文件。', readyHelp:'从左侧选择结构节点，在右侧配置 Visual、Collision 和物理属性。', stepUrdf:'1 导入 URDF', stepMesh:'2 添加 Mesh', stepEdit:'3 编辑与调试', chooseUrdf:'选择 URDF 文件', uploadMeshFile:'上传 Mesh 文件', chooseFirstLink:'选择第一个 Link' },
  en: { liveInterface:'Live Joint Interface', closePanel:'Close Interface Panel', gateway:'gRPC-Web Gateway', deviceAddress:'http://device-address:port', armScope:'Arm Scope', bothArms:'Both Arms (0 + 1)', leftArm:'Left Arm (0)', rightArm:'Right Arm (1)', getStatus:'Get Status', stopSync:'Stop Sync', keepSync:'Continuous Sync', notConnected:'Not Connected', fetching:'Fetching joint states…', synced:'Synced {count} joints', connectionFailed:'Interface connection failed', viewSwitch:'3D View Switcher', isoView:'Isometric View', axisView:'{axis}-axis View', switchTo:'Switch to {view}', step:'Step {step}', startUrdf:'Start by Importing a URDF', addMeshNext:'Structure Ready—Add Meshes', resourcesReady:'Base Resources Ready', urdfHelp:'The robot name and Link / Joint hierarchy will be parsed without sample data.', meshHelp:'Parsed {links} Links and {joints} Joints. Now attach the mesh files.', readyHelp:'Select a structure node on the left, then configure Visual, Collision, and Physics on the right.', stepUrdf:'1 Import URDF', stepMesh:'2 Add Mesh', stepEdit:'3 Edit & Debug', chooseUrdf:'Choose URDF File', uploadMeshFile:'Upload Mesh Files', chooseFirstLink:'Select First Link' },
  ms: { liveInterface:'Antara Muka Sendi Langsung', closePanel:'Tutup Panel Antara Muka', gateway:'Gerbang gRPC-Web', deviceAddress:'http://alamat-peranti:port', armScope:'Skop Lengan', bothArms:'Kedua-dua Lengan (0 + 1)', leftArm:'Lengan Kiri (0)', rightArm:'Lengan Kanan (1)', getStatus:'Dapatkan Status', stopSync:'Henti Segerak', keepSync:'Segerak Berterusan', notConnected:'Belum Bersambung', fetching:'Mendapatkan status sendi…', synced:'{count} sendi disegerakkan', connectionFailed:'Sambungan antara muka gagal', viewSwitch:'Penukar Pandangan 3D', isoView:'Pandangan Isometrik', axisView:'Pandangan Paksi {axis}', switchTo:'Tukar ke {view}', step:'Langkah {step}', startUrdf:'Mulakan dengan Import URDF', addMeshNext:'Struktur Sedia—Tambah Mesh', resourcesReady:'Sumber Asas Sedia', urdfHelp:'Nama robot dan hierarki Link / Joint akan dihuraikan tanpa data contoh.', meshHelp:'{links} Link dan {joints} Joint dihuraikan. Sekarang lampirkan fail mesh.', readyHelp:'Pilih nod di kiri, kemudian tetapkan Visual, Collision dan Fizik di kanan.', stepUrdf:'1 Import URDF', stepMesh:'2 Tambah Mesh', stepEdit:'3 Edit & Nyahpepijat', chooseUrdf:'Pilih Fail URDF', uploadMeshFile:'Muat Naik Fail Mesh', chooseFirstLink:'Pilih Link Pertama' },
  vi: { liveInterface:'Giao diện khớp trực tiếp', closePanel:'Đóng bảng giao diện', gateway:'Cổng gRPC-Web', deviceAddress:'http://địa-chỉ-thiết-bị:cổng', armScope:'Phạm vi cánh tay', bothArms:'Cả hai tay (0 + 1)', leftArm:'Tay trái (0)', rightArm:'Tay phải (1)', getStatus:'Lấy trạng thái', stopSync:'Dừng đồng bộ', keepSync:'Đồng bộ liên tục', notConnected:'Chưa kết nối', fetching:'Đang lấy trạng thái khớp…', synced:'Đã đồng bộ {count} khớp', connectionFailed:'Kết nối giao diện thất bại', viewSwitch:'Chuyển góc nhìn 3D', isoView:'Góc nhìn đẳng cự', axisView:'Góc nhìn trục {axis}', switchTo:'Chuyển sang {view}', step:'Bước {step}', startUrdf:'Bắt đầu bằng cách nhập URDF', addMeshNext:'Đã có cấu trúc—Thêm Mesh', resourcesReady:'Tài nguyên cơ bản đã sẵn sàng', urdfHelp:'Tên robot và phân cấp Link / Joint sẽ được phân tích mà không có dữ liệu mẫu.', meshHelp:'Đã phân tích {links} Link và {joints} Joint. Bây giờ hãy gắn các tệp mesh.', readyHelp:'Chọn nút bên trái, rồi cấu hình Hiển thị, Va chạm và Vật lý bên phải.', stepUrdf:'1 Nhập URDF', stepMesh:'2 Thêm Mesh', stepEdit:'3 Sửa & Gỡ lỗi', chooseUrdf:'Chọn tệp URDF', uploadMeshFile:'Tải tệp Mesh', chooseFirstLink:'Chọn Link đầu tiên' },
  'zh-Hant': { liveInterface:'即時關節介面', closePanel:'關閉介面面板', gateway:'gRPC-Web 閘道', deviceAddress:'http://裝置位址:連接埠', armScope:'機械臂範圍', bothArms:'雙臂（0 + 1）', leftArm:'左臂（0）', rightArm:'右臂（1）', getStatus:'取得狀態', stopSync:'停止同步', keepSync:'持續同步', notConnected:'尚未連線', fetching:'正在取得關節狀態…', synced:'已同步 {count} 個關節', connectionFailed:'介面連線失敗', viewSwitch:'3D 視角切換', isoView:'等角視角', axisView:'{axis} 軸視角', switchTo:'切換至{view}', step:'第 {step} 步', startUrdf:'從匯入 URDF 開始', addMeshNext:'結構已產生，繼續新增 Mesh', resourcesReady:'基礎資源已準備完成', urdfHelp:'系統會解析機器人名稱及 Link / Joint 層級，不會預置範例資料。', meshHelp:'已解析 {links} 個 Link 和 {joints} 個 Joint。現在關聯網格檔案。', readyHelp:'從左側選擇結構節點，在右側設定視覺、碰撞與物理屬性。', stepUrdf:'1 匯入 URDF', stepMesh:'2 新增 Mesh', stepEdit:'3 編輯與除錯', chooseUrdf:'選擇 URDF 檔案', uploadMeshFile:'上傳 Mesh 檔案', chooseFirstLink:'選擇第一個 Link' },
};

type NodeKind = 'link' | 'joint' | 'mount' | 'mesh';
type PropertyTab = 'visual' | 'collision' | 'physics';
type RotationMode = 'euler' | 'radian' | 'quaternion';
type ViewPreset = 'iso' | 'x' | 'y' | 'z';


interface RobotNode {
  id: string;
  name: string;
  kind: NodeKind;
  depth: number;
  visible: boolean;
  locked: boolean;
}

interface MeshResource {
  id: string;
  name: string;
  size: string;
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
}

type Vector3 = [number, number, number];

interface CollisionGeometry {
  id: string;
  name: string;
  visible: boolean;
  mesh: string;
  scale: Vector3;
  position: Vector3;
  rotationRad: Vector3;
  rotationMode: RotationMode;
}

interface InertialConfig {
  reference: string;
  position: Vector3;
  rotationRad: Vector3;
  rotationMode: RotationMode;
  mass: number;
  center: Vector3;
  inertia: { ixx: number; ixy: number; ixz: number; iyy: number; iyz: number; izz: number };
  density: string;
  principalMoments: Vector3;
  principalAxes: [Vector3, Vector3, Vector3];
}

interface LinkConfiguration {
  collisions: CollisionGeometry[];
  inertial: InertialConfig;
}

interface ModelAsset {
  name: string;
  size: string;
  path: string;
}

const MARVIN_MODEL_BASE = `${import.meta.env.BASE_URL}models/marvin`;

const INITIAL_NODES: RobotNode[] = [
  { id: 'Link_Base', name: 'Link_Base', kind: 'link', depth: 0, visible: true, locked: false },
  { id: 'Joint_Stand', name: 'Joint_Stand', kind: 'joint', depth: 1, visible: true, locked: false },
  { id: 'Link_Stand', name: 'Link_Stand', kind: 'link', depth: 2, visible: true, locked: false },
  { id: 'Joint0_L', name: 'Joint0_L', kind: 'joint', depth: 3, visible: true, locked: false },
  { id: 'Base_L', name: 'Base_L', kind: 'link', depth: 4, visible: true, locked: false },
  ...Array.from({ length: 7 }).flatMap((_, index) => [
    { id: `Joint${index + 1}_L`, name: `Joint${index + 1}_L`, kind: 'joint' as const, depth: 5 + index * 2, visible: true, locked: false },
    { id: `Link${index + 1}_L`, name: `Link${index + 1}_L`, kind: 'link' as const, depth: 6 + index * 2, visible: true, locked: false },
  ]),
  { id: 'TCP_Joint_L', name: 'TCP_Joint_L', kind: 'joint', depth: 19, visible: true, locked: false },
  { id: 'TCP_Link_L', name: 'TCP_Link_L', kind: 'mount', depth: 20, visible: true, locked: false },
  { id: 'Joint0_R', name: 'Joint0_R', kind: 'joint', depth: 3, visible: true, locked: false },
  { id: 'Base_R', name: 'Base_R', kind: 'link', depth: 4, visible: true, locked: false },
  ...Array.from({ length: 7 }).flatMap((_, index) => [
    { id: `Joint${index + 1}_R`, name: `Joint${index + 1}_R`, kind: 'joint' as const, depth: 5 + index * 2, visible: true, locked: false },
    { id: `Link${index + 1}_R`, name: `Link${index + 1}_R`, kind: 'link' as const, depth: 6 + index * 2, visible: true, locked: false },
  ]),
  { id: 'TCP_Joint_R', name: 'TCP_Joint_R', kind: 'joint', depth: 19, visible: true, locked: false },
  { id: 'TCP_Link_R', name: 'TCP_Link_R', kind: 'mount', depth: 20, visible: true, locked: false },
];

const MARVIN_ASSETS: ModelAsset[] = [
  ['Link_Base.STL', '7.6 MB'], ['Link_Stand.STL', '1.2 MB'], ['Base_L.STL', '200 KB'], ['Base_R.STL', '200 KB'],
  ['Link1_L.STL', '550 KB'], ['Link2_L.STL', '1.2 MB'], ['Link3_L.STL', '621 KB'], ['Link4_L.STL', '1.2 MB'],
  ['Link5_L.STL', '1.1 MB'], ['Link6_L.STL', '304 KB'], ['Link7_L.STL', '2.4 MB'], ['TCP_Link_L.STL', '6.1 KB'],
  ['Link1_R.STL', '550 KB'], ['Link2_R.STL', '1.2 MB'], ['Link3_R.STL', '621 KB'], ['Link4_R.STL', '1.2 MB'],
  ['Link5_R.STL', '1.1 MB'], ['Link6_R.STL', '304 KB'], ['Link7_R.STL', '2.5 MB'], ['TCP_Link_R.STL', '6.1 KB'],
].map(([name, size]) => ({ name, size, path: `${MARVIN_MODEL_BASE}/meshes/${name}` }));

function defaultInertial(reference = 'Joint_Stand'): InertialConfig {
  return {
    reference,
    position: [0, 0.00000133, 0.1597],
    rotationRad: [0, 0, 0],
    rotationMode: 'euler',
    mass: 74.515,
    center: [0, 0.00000133, 0.1597],
    inertia: { ixx: 8.67491803, ixy: 0.07182226, ixz: 0, iyy: 8.67495749, iyz: 0.00008096, izz: 4.32871357 },
    density: 'N/A',
    principalMoments: [8.746739, 8.603176, 4.328674],
    principalAxes: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  };
}

function emptyInertial(reference = ''): InertialConfig {
  return {
    reference,
    position: [0, 0, 0],
    rotationRad: [0, 0, 0],
    rotationMode: 'euler',
    mass: 0,
    center: [0, 0, 0],
    inertia: { ixx: 0, ixy: 0, ixz: 0, iyy: 0, iyz: 0, izz: 0 },
    density: 'N/A',
    principalMoments: [0, 0, 0],
    principalAxes: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  };
}

function defaultLinkConfiguration(linkName = 'Link_Base'): LinkConfiguration {
  return {
    collisions: [{ id: `${linkName}-collision-1`, name: `${linkName}_collision`, visible: true, mesh: `${linkName}.STL`, scale: [1, 1, 1], position: [0, 0, 0], rotationRad: [0, 0, 0], rotationMode: 'euler' }],
    inertial: defaultInertial(),
  };
}

const INITIAL_MESHES: MeshResource[] = [
  { id: 'mesh-1', name: 'Link_Base.STL', size: '7.6 MB', scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
  { id: 'mesh-2', name: 'Link_Stand.STL', size: '1.2 MB', scale: [1, 1, 1], position: [0, 0, 0.042], rotation: [0, 0, 0] },
];

const JOINTS = [
  ...['L', 'R'].flatMap(side => [
    { id: `Joint1_${side}`, name: `${side}1`, min: -3.1067, max: 3.1067 },
    { id: `Joint2_${side}`, name: `${side}2`, min: -2.0944, max: 2.0944 },
    { id: `Joint3_${side}`, name: `${side}3`, min: -3.1067, max: 3.1067 },
    { id: `Joint4_${side}`, name: `${side}4`, min: -2.5307, max: 1.0472 },
    { id: `Joint5_${side}`, name: `${side}5`, min: -3.1067, max: 3.1067 },
    { id: `Joint6_${side}`, name: `${side}6`, min: -1.0472, max: 1.0472 },
    { id: `Joint7_${side}`, name: `${side}7`, min: -1.5708, max: 1.5708 },
  ]),
];

function nodeIcon(kind: NodeKind) {
  if (kind === 'joint') return <CircleDot size={14} />;
  if (kind === 'mount') return <Link2 size={14} />;
  if (kind === 'mesh') return <FileBox size={14} />;
  return <Cuboid size={14} />;
}

const NODE_KIND_LABEL: Record<NodeKind, string> = { link: 'Link', joint: 'Joint', mount: 'Mount', mesh: 'Mesh' };
function parseVector(value: string | null, fallback: Vector3 = [0, 0, 0]): Vector3 {
  const parts = (value ?? '').trim().split(/\s+/).map(Number);
  return parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite) ? [parts[0], parts[1], parts[2]] : fallback;
}

function basename(path: string) { return path.split('/').pop() || path; }

function parseUrdfModel(source: string): { nodes: RobotNode[]; linkConfigurations: Record<string, LinkConfiguration> } {
  const xml = new DOMParser().parseFromString(source, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('URDF 文件格式无法解析');
  const links = Array.from(xml.querySelectorAll('robot > link')).map(item => item.getAttribute('name')).filter(Boolean) as string[];
  const joints = Array.from(xml.querySelectorAll('robot > joint')).map(item => ({
    name: item.getAttribute('name') || 'joint',
    parent: item.querySelector('parent')?.getAttribute('link') || '',
    child: item.querySelector('child')?.getAttribute('link') || '',
  }));
  if (!links.length) throw new Error('文件中未找到 Link 结构');
  const childLinks = new Set(joints.map(item => item.child));
  const root = links.find(link => !childLinks.has(link)) || links[0];
  const output: RobotNode[] = [];
  const walk = (link: string, depth: number) => {
    output.push({ id: link, name: link, kind: 'link', depth, visible: true, locked: false });
    joints.filter(item => item.parent === link).forEach(joint => {
      const jointId = joint.name;
      output.push({ id: jointId, name: joint.name, kind: 'joint', depth: depth + 1, visible: true, locked: false });
      if (joint.child) walk(joint.child, depth + 2);
    });
  };
  walk(root, 0);
  const linkConfigurations: Record<string, LinkConfiguration> = {};
  Array.from(xml.querySelectorAll('robot > link')).forEach(link => {
    const name = link.getAttribute('name') || 'link';
    const collisions = Array.from(link.querySelectorAll(':scope > collision')).map((collision, index): CollisionGeometry => {
      const mesh = collision.querySelector('geometry > mesh');
      const origin = collision.querySelector(':scope > origin');
      return {
        id: `${name}-collision-${index + 1}`,
        name: collision.getAttribute('name') || `${name}_collision_${index + 1}`,
        visible: true,
        mesh: basename(mesh?.getAttribute('filename') || ''),
        scale: parseVector(mesh?.getAttribute('scale'), [1, 1, 1]),
        position: parseVector(origin?.getAttribute('xyz')),
        rotationRad: parseVector(origin?.getAttribute('rpy')),
        rotationMode: 'euler',
      };
    });
    const inertial = link.querySelector(':scope > inertial');
    const inertialOrigin = inertial?.querySelector(':scope > origin');
    const inertia = inertial?.querySelector(':scope > inertia');
    const position = parseVector(inertialOrigin?.getAttribute('xyz'));
    linkConfigurations[name] = {
      collisions,
      inertial: {
        ...emptyInertial(),
        position,
        center: position,
        rotationRad: parseVector(inertialOrigin?.getAttribute('rpy')),
        mass: Math.max(0, Number(inertial?.querySelector(':scope > mass')?.getAttribute('value')) || 0),
        inertia: {
          ixx: Number(inertia?.getAttribute('ixx')) || 0,
          ixy: Number(inertia?.getAttribute('ixy')) || 0,
          ixz: Number(inertia?.getAttribute('ixz')) || 0,
          iyy: Number(inertia?.getAttribute('iyy')) || 0,
          iyz: Number(inertia?.getAttribute('iyz')) || 0,
          izz: Number(inertia?.getAttribute('izz')) || 0,
        },
      },
    };
  });
  return { nodes: output, linkConfigurations };
}

function NumericTriplet({ value, onChange, labels = ['X', 'Y', 'Z'], step = 0.01, readOnly = false }: { value: [number, number, number]; onChange: (next: [number, number, number]) => void; labels?: string[]; step?: number; readOnly?: boolean }) {
  return <div className="urdf-triplet">{value.map((item, index) => <label key={labels[index]}><span>{labels[index]}</span><input type="number" step={step} value={item} readOnly={readOnly} onChange={event => { const next = [...value] as [number, number, number]; next[index] = Number(event.target.value); onChange(next); }} /></label>)}</div>;
}

function eulerToQuaternion([roll, pitch, yaw]: Vector3): [number, number, number, number] {
  const cr = Math.cos(roll / 2), sr = Math.sin(roll / 2), cp = Math.cos(pitch / 2), sp = Math.sin(pitch / 2), cy = Math.cos(yaw / 2), sy = Math.sin(yaw / 2);
  return [sr * cp * cy - cr * sp * sy, cr * sp * cy + sr * cp * sy, cr * cp * sy - sr * sp * cy, cr * cp * cy + sr * sp * sy];
}

function quaternionToEuler([x, y, z, w]: [number, number, number, number]): Vector3 {
  const roll = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
  const pitchInput = 2 * (w * y - z * x);
  const pitch = Math.abs(pitchInput) >= 1 ? Math.sign(pitchInput) * Math.PI / 2 : Math.asin(pitchInput);
  const yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
  return [roll, pitch, yaw];
}

function RotationEditor({ mode, value, onModeChange, onChange }: { mode: RotationMode; value: Vector3; onModeChange: (mode: RotationMode) => void; onChange: (value: Vector3) => void }) {
  const { locale } = useI18n();
  const e = EDITOR_COPY[locale];
  const degrees = value.map(item => Number((item * 180 / Math.PI).toFixed(4))) as Vector3;
  const quaternion = eulerToQuaternion(value);
  return <div className="urdf-rotation-editor">
    <ArcoSelect scope="robot" value={mode} onChange={event => onModeChange(event.target.value as RotationMode)} aria-label={e.rotation}><option value="euler">{e.euler}</option><option value="radian">{e.radian}</option><option value="quaternion">{e.quaternion}</option></ArcoSelect>
    {mode === 'quaternion' ? <div className="urdf-quaternion">{quaternion.map((item, index) => <label key={index}><span>{['X','Y','Z','W'][index]}</span><input type="number" step="0.0001" value={Number(item.toFixed(6))} onChange={event => { const next = [...quaternion] as [number, number, number, number]; next[index] = Number(event.target.value); onChange(quaternionToEuler(next)); }}/></label>)}</div> : <NumericTriplet value={mode === 'euler' ? degrees : value} labels={['R','P','Y']} step={mode === 'euler' ? 1 : 0.01} onChange={next => onChange(mode === 'euler' ? next.map(item => item * Math.PI / 180) as Vector3 : next)} />}
    <div className="urdf-quick"><button type="button" onClick={() => onChange([value[0], value[1], -Math.PI / 2])}>Yaw −90°</button><button type="button" onClick={() => onChange([value[0], value[1], Math.PI / 2])}>Yaw +90°</button></div>
  </div>;
}

export function RobotComponentLibrary2({ themeMode = 'light', stylePreset = 'current', industrialColorTheme = 'steel', onEditingChange }: { themeMode?: ThemeMode; stylePreset?: StylePreset; industrialColorTheme?: IndustrialColorTheme; onEditingChange?: (editing: boolean) => void }) {
  const { locale } = useI18n();
  const ui = ROBOT_LIBRARY_COPY[locale];
  const e = EDITOR_COPY[locale];
  const x = EDITOR_EXTRA_COPY[locale];
  const action = GLOBAL_ACTION_COPY[locale];
  const propertyTabs: Array<{ key: PropertyTab; label: string }> = [{ key:'visual', label:e.visual }, { key:'collision', label:e.collision }, { key:'physics', label:e.physics }];
  const [editing, setEditing] = useState(false);
  const [projectMode, setProjectMode] = useState<'demo' | 'new'>('demo');
  const [projectName, setProjectName] = useState('Marvin M6-S-CCS-696-V4.0');
  const projectModeRef = useRef<'demo' | 'new'>('demo');
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [selectedId, setSelectedId] = useState('Link_Base');
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [assetQuery, setAssetQuery] = useState('');
  const [assetSearchOpen, setAssetSearchOpen] = useState(false);
  const [structureSearchOpen, setStructureSearchOpen] = useState(false);
  const [dragOverNodeId, setDragOverNodeId] = useState('');
  const [assets, setAssets] = useState<ModelAsset[]>(MARVIN_ASSETS);
  const [previewAsset, setPreviewAsset] = useState('');
  const [linkConfigurations, setLinkConfigurations] = useState<Record<string, LinkConfiguration>>({ Link_Base: defaultLinkConfiguration('Link_Base') });
  const [activeCollisionId, setActiveCollisionId] = useState('Link_Base-collision-1');
  const [jointValues, setJointValues] = useState<Record<string, number>>(() => Object.fromEntries(JOINTS.map(joint => [joint.id, 0])));
  const [activeJointId, setActiveJointId] = useState('Joint1_L');
  const [jointAngleUnit, setJointAngleUnit] = useState<'deg' | 'rad'>('rad');
  const [meshes, setMeshes] = useState(INITIAL_MESHES);
  const [activeMeshId, setActiveMeshId] = useState('mesh-1');
  const [tab, setTab] = useState<PropertyTab>('visual');
  const [rotationMode, setRotationMode] = useState<RotationMode>('euler');
  const [materialColor, setMaterialColor] = useState('#8A9BA8');
  const [opacity, setOpacity] = useState(100);
  const [saved, setSaved] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [modelLoadState, setModelLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [modelSelectionInfo, setModelSelectionInfo] = useState<ModelSelectionInfo | null>(null);
  const [resetViewToken, setResetViewToken] = useState(0);
  const [viewPreset, setViewPreset] = useState<ViewPreset>('iso');
  const [viewPresetToken, setViewPresetToken] = useState(0);
  const [interfaceOpen, setInterfaceOpen] = useState(false);
  const [grpcUrl, setGrpcUrl] = useState('http://172.31.22.123:6700');
  const [armScope, setArmScope] = useState<'both' | '0' | '1'>('both');
  const [interfaceStatus, setInterfaceStatus] = useState('');
  const [continuousSync, setContinuousSync] = useState(false);
  const interfaceBusyRef = useRef(false);
  const [showGrid, setShowGrid] = useState(true);
  const urdfRef = useRef<HTMLInputElement>(null);
  const glbRef = useRef<HTMLInputElement>(null);
  const textureRef = useRef<HTMLInputElement>(null);
  projectModeRef.current = projectMode;
  const fallbackNode: RobotNode = { id: '', name: '', kind: 'link', depth: 0, visible: true, locked: false };
  const selectedNode = nodes.find(node => node.id === selectedId) ?? nodes[0] ?? fallbackNode;
  const selectedNodeIndex = nodes.indexOf(selectedNode);
  const childLinkNode = selectedNode.kind === 'joint' ? nodes.slice(selectedNodeIndex + 1).find(node => node.kind === 'link' && node.depth === selectedNode.depth + 1) : undefined;
  const activeLinkNode = selectedNode.kind === 'link' ? selectedNode : childLinkNode ?? [...nodes.slice(0, selectedNodeIndex + 1)].reverse().find(node => node.kind === 'link') ?? nodes[0] ?? fallbackNode;
  const activeLinkId = activeLinkNode.id;
  const activeLinkConfig = linkConfigurations[activeLinkId] ?? defaultLinkConfiguration(activeLinkId);
  const activeCollision = activeLinkConfig.collisions.find(collision => collision.id === activeCollisionId) ?? activeLinkConfig.collisions[0];
  const selectedMesh = meshes.find(mesh => mesh.id === activeMeshId) ?? meshes[0];
  const themeVars = getRobotThemeVars(themeMode, stylePreset, industrialColorTheme) as React.CSSProperties;
  const filteredNodes = useMemo(() => {
    if (query) return nodes.filter(node => node.name.toLowerCase().includes(query.toLowerCase()));
    let collapsedDepth: number | null = null;
    return nodes.filter(node => {
      if (collapsedDepth !== null && node.depth <= collapsedDepth) collapsedDepth = null;
      if (collapsedDepth !== null && node.depth > collapsedDepth) return false;
      if (collapsedNodes.has(node.id)) collapsedDepth = node.depth;
      return true;
    });
  }, [collapsedNodes, nodes, query]);
  const filteredAssets = useMemo(() => assets.filter(asset => !assetQuery || asset.name.toLowerCase().includes(assetQuery.toLowerCase())), [assetQuery, assets]);
  const availableJoints = useMemo(() => {
    if (projectMode === 'demo') return JOINTS;
    return nodes.filter(node => node.kind === 'joint').map(node => JOINTS.find(joint => joint.id === node.name) ?? { id: node.name, name: node.name, min: -Math.PI, max: Math.PI });
  }, [nodes, projectMode]);
  const hiddenNodeIds = useMemo(() => nodes.filter(node => !node.visible).map(node => node.id), [nodes]);
  const handleViewerSelect = useCallback((name: string) => {
    setSelectedId(name);
    setActiveCollisionId(`${name}-collision-1`);
  }, []);
  const handleViewerLoadState = useCallback((state: 'loading' | 'ready' | 'error') => setModelLoadState(state), []);
  const handleSelectionInfo = useCallback((info: ModelSelectionInfo) => setModelSelectionInfo(info), []);
  const changeViewPreset = (preset: ViewPreset) => {
    setViewPreset(preset);
    setViewPresetToken(current => current + 1);
  };
  const fetchRemoteJointStates = useCallback(async () => {
    if (interfaceBusyRef.current) return;
    interfaceBusyRef.current = true;
    setInterfaceStatus(x.fetching);
    try {
      const indexes = armScope === 'both' ? [0, 1] : [Number(armScope)];
      const batches = await Promise.all(indexes.map(index => getLatestArmJointStates(grpcUrl, index)));
      const remote = batches.flat();
      setJointValues(current => {
        const next = { ...current };
        remote.forEach(joint => {
          const match = joint.name.match(/^joint([1-7])_(left|right)$/i);
          const key = match ? `Joint${match[1]}_${match[2].toLowerCase() === 'left' ? 'L' : 'R'}` : joint.name;
          if (key in next) next[key] = joint.position;
        });
        return next;
      });
      setInterfaceStatus(x.synced.replace('{count}', String(remote.length)));
    } catch (error) {
      setInterfaceStatus(error instanceof Error ? error.message : x.connectionFailed);
      setContinuousSync(false);
    } finally { interfaceBusyRef.current = false; }
  }, [armScope, grpcUrl, x]);

  useEffect(() => {
    if (!continuousSync) return;
    void fetchRemoteJointStates();
    const timer = window.setInterval(() => void fetchRemoteJointStates(), 500);
    return () => window.clearInterval(timer);
  }, [continuousSync, fetchRemoteJointStates]);

  useEffect(() => {
    const draft = window.localStorage.getItem('robot-component-library-2-draft');
    if (!draft) {
      fetch(`${MARVIN_MODEL_BASE}/urdf/Marvin M6-S-CCS-696-V4.0_Base_and_Stand_Asm urdf.urdf`)
        .then(response => response.text())
        .then(source => {
          if (projectModeRef.current !== 'demo') return;
          const parsed = parseUrdfModel(source);
          setNodes(parsed.nodes);
          setLinkConfigurations(parsed.linkConfigurations);
          setSelectedId(parsed.nodes[0]?.id ?? 'Link_Base');
          setActiveCollisionId(parsed.linkConfigurations[parsed.nodes[0]?.id]?.collisions[0]?.id ?? '');
        })
        .catch(() => { /* 内置结构仍可作为离线回退 */ });
      return;
    }
    try {
      const restored = JSON.parse(draft);
      if (Array.isArray(restored.nodes)) setNodes(restored.nodes);
      if (restored.linkConfigurations) setLinkConfigurations(restored.linkConfigurations);
      if (Array.isArray(restored.meshes)) setMeshes(restored.meshes);
      if (restored.jointValues) setJointValues(restored.jointValues);
      if (typeof restored.showGrid === 'boolean') setShowGrid(restored.showGrid);
      else if (typeof restored.showHelpers?.grid === 'boolean') setShowGrid(restored.showHelpers.grid);
      if (typeof restored.materialColor === 'string') setMaterialColor(restored.materialColor);
      if (typeof restored.opacity === 'number') setOpacity(restored.opacity);
    } catch { /* 保留内置 Marvin 示例数据 */ }
  }, []);

  function changeEditing(next: boolean) {
    setEditing(next);
    onEditingChange?.(next);
  }

  function startNewComponent() {
    setProjectMode('new');
    setProjectName('未命名机器人组件');
    setNodes([]);
    setAssets([]);
    setMeshes([]);
    setLinkConfigurations({});
    setJointValues({});
    setSelectedId('');
    setActiveJointId('');
    setActiveCollisionId('');
    setActiveMeshId('');
    setPreviewAsset('');
    setModelSelectionInfo(null);
    setImportMessage('');
    setCollapsedNodes(new Set());
    changeEditing(true);
  }

  function openDemoComponent() {
    setProjectMode('demo');
    setProjectName('Marvin M6-S-CCS-696-V4.0');
    setNodes(INITIAL_NODES);
    setAssets(MARVIN_ASSETS);
    setMeshes(INITIAL_MESHES);
    setLinkConfigurations({ Link_Base: defaultLinkConfiguration('Link_Base') });
    setJointValues(Object.fromEntries(JOINTS.map(joint => [joint.id, 0])));
    setSelectedId('Link_Base');
    setActiveJointId('Joint1_L');
    setActiveCollisionId('Link_Base-collision-1');
    setActiveMeshId('mesh-1');
    setPreviewAsset('');
    setModelSelectionInfo(null);
    changeEditing(true);
  }

  function handlePropertyTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? propertyTabs.length - 1 : direction ? (index + direction + propertyTabs.length) % propertyTabs.length : null;
    if (nextIndex === null) return;
    event.preventDefault();
    setTab(propertyTabs[nextIndex].key);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
  }

  function updateMesh(patch: Partial<MeshResource>) {
    setMeshes(current => current.map(mesh => mesh.id === activeMeshId ? { ...mesh, ...patch } : mesh));
  }

  function updateActiveLinkConfig(updater: (current: LinkConfiguration) => LinkConfiguration) {
    setLinkConfigurations(current => ({ ...current, [activeLinkId]: updater(current[activeLinkId] ?? defaultLinkConfiguration(activeLinkId)) }));
  }

  function updateActiveCollision(patch: Partial<CollisionGeometry>) {
    if (!activeCollision) return;
    updateActiveLinkConfig(current => ({ ...current, collisions: current.collisions.map(item => item.id === activeCollision.id ? { ...item, ...patch } : item) }));
  }

  function updateInertial(patch: Partial<InertialConfig>) {
    updateActiveLinkConfig(current => ({ ...current, inertial: { ...current.inertial, ...patch } }));
  }

  function addCollision() {
    const id = `${activeLinkId}-collision-${Date.now()}`;
    const collision: CollisionGeometry = { id, name: `${activeLinkId}_collision_${activeLinkConfig.collisions.length + 1}`, visible: true, mesh: previewAsset, scale: [1, 1, 1], position: [0, 0, 0], rotationRad: [0, 0, 0], rotationMode: 'euler' };
    updateActiveLinkConfig(current => ({ ...current, collisions: [...current.collisions, collision] }));
    setActiveCollisionId(id);
  }

  function deleteCollision(id: string) {
    const remaining = activeLinkConfig.collisions.filter(item => item.id !== id);
    updateActiveLinkConfig(current => ({ ...current, collisions: remaining }));
    setActiveCollisionId(remaining[0]?.id ?? '');
  }

  function handleUrdf(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseUrdfModel(String(reader.result));
        const firstNode = parsed.nodes[0];
        const parsedJoints = parsed.nodes.filter(item => item.kind === 'joint');
        setNodes(parsed.nodes); setLinkConfigurations(parsed.linkConfigurations); setSelectedId(firstNode?.id ?? ''); setActiveCollisionId(firstNode ? parsed.linkConfigurations[firstNode.id]?.collisions[0]?.id ?? '' : ''); setJointValues(Object.fromEntries(parsedJoints.map(joint => [joint.name, 0]))); setActiveJointId(parsedJoints[0]?.name ?? '');
        if (projectMode === 'new') setProjectName(file.name.replace(/\.(urdf|xml)$/i, '') || '未命名机器人组件');
        setImportMessage(`${file.name} · 已解析 ${parsed.nodes.filter(item => item.kind === 'link').length} 个 Link`);
      } catch (error) { setImportMessage(error instanceof Error ? error.message : 'URDF 导入失败'); }
    };
    reader.readAsText(file);
  }

  function handleGlb(files: FileList | null) {
    if (!files?.length) return;
    const additions = Array.from(files).map((file, index) => ({ id: `mesh-${Date.now()}-${index}`, name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, scale: [1, 1, 1] as [number, number, number], position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] }));
    setMeshes(current => [...current, ...additions]); setAssets(current => [...current, ...Array.from(files).map(file => ({ name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, path: URL.createObjectURL(file) }))]); setActiveMeshId(additions[0].id); setPreviewAsset(additions[0].name); setImportMessage(`已关联 ${additions.length} 个网格资源`);
  }

  function removeAsset(assetName: string) {
    const target = assets.find(asset => asset.name === assetName);
    if (target?.path.startsWith('blob:')) URL.revokeObjectURL(target.path);
    setAssets(current => current.filter(asset => asset.name !== assetName));
    setMeshes(current => current.filter(mesh => mesh.name !== assetName));
    setNodes(current => current.filter(node => !(node.kind === 'mesh' && node.name === assetName)));
    setLinkConfigurations(current => Object.fromEntries(Object.entries(current).map(([linkId, config]) => [linkId, { ...config, collisions: config.collisions.map(collision => collision.mesh === assetName ? { ...collision, mesh: '' } : collision) }])));
    if (previewAsset === assetName) setPreviewAsset('');
    setImportMessage(`${assetName} 已从素材库移除`);
  }

  function attachAssetToLink(assetName: string, targetLinkId = activeLinkId) {
    const targetIndex = nodes.findIndex(node => node.id === targetLinkId && node.kind === 'link');
    const asset = assets.find(item => item.name === assetName);
    if (targetIndex < 0 || !asset) {
      setImportMessage('请先选择一个 Link，再添加模型素材');
      return;
    }
    const target = nodes[targetIndex];
    const nodeId = `${target.id}::mesh::${assetName}::${Date.now()}`;
    const meshNode: RobotNode = { id: nodeId, name: assetName, kind: 'mesh', depth: target.depth + 1, visible: true, locked: false };
    setNodes(current => {
      const index = current.findIndex(node => node.id === target.id);
      const next = [...current];
      next.splice(index + 1, 0, meshNode);
      return next;
    });
    let meshId = meshes.find(mesh => mesh.name === assetName)?.id;
    if (!meshId) {
      meshId = `mesh-${Date.now()}`;
      setMeshes(current => [...current, { id: meshId!, name: asset.name, size: asset.size, scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] }]);
    }
    setSelectedId(nodeId);
    setActiveMeshId(meshId);
    setPreviewAsset(assetName);
    setImportMessage(`${assetName} 已添加到 ${target.name}`);
  }

  function deleteStructureNode(id: string) {
    const index = nodes.findIndex(node => node.id === id);
    if (index < 0) return;
    const depth = nodes[index].depth;
    let end = index + 1;
    while (end < nodes.length && nodes[end].depth > depth) end += 1;
    const removed = nodes.slice(index, end);
    const removedIds = new Set(removed.map(node => node.id));
    const removedJointNames = new Set(removed.filter(node => node.kind === 'joint').map(node => node.name));
    const next = [...nodes.slice(0, index), ...nodes.slice(end)];
    setNodes(next);
    setLinkConfigurations(current => Object.fromEntries(Object.entries(current).filter(([linkId]) => !removedIds.has(linkId))));
    setJointValues(current => Object.fromEntries(Object.entries(current).filter(([jointName]) => !removedJointNames.has(jointName))));
    if (removedIds.has(selectedId)) setSelectedId(next[Math.max(0, index - 1)]?.id ?? next[0]?.id ?? '');
    setImportMessage('结构节点已删除');
  }

  function moveStructureNode(sourceId: string, targetLinkId: string) {
    setNodes(current => {
      const sourceIndex = current.findIndex(node => node.id === sourceId);
      const targetIndex = current.findIndex(node => node.id === targetLinkId && node.kind === 'link');
      if (sourceIndex < 0 || targetIndex < 0 || sourceId === targetLinkId) return current;
      const sourceDepth = current[sourceIndex].depth;
      let sourceEnd = sourceIndex + 1;
      while (sourceEnd < current.length && current[sourceEnd].depth > sourceDepth) sourceEnd += 1;
      if (targetIndex >= sourceIndex && targetIndex < sourceEnd) return current;
      const block = current.slice(sourceIndex, sourceEnd);
      const remainder = [...current.slice(0, sourceIndex), ...current.slice(sourceEnd)];
      const adjustedTargetIndex = remainder.findIndex(node => node.id === targetLinkId);
      const targetDepth = remainder[adjustedTargetIndex].depth;
      const depthDelta = targetDepth + 1 - sourceDepth;
      const moved = block.map(node => ({ ...node, depth: Math.max(0, node.depth + depthDelta) }));
      remainder.splice(adjustedTargetIndex + 1, 0, ...moved);
      return remainder;
    });
    setSelectedId(sourceId);
    setImportMessage('模型结构层级已更新');
  }

  function toggleNode(id: string, key: 'visible' | 'locked') {
    setNodes(current => current.map(node => node.id === id ? { ...node, [key]: !node[key] } : node));
  }

  function save() {
    window.localStorage.setItem('robot-component-library-2-draft', JSON.stringify({ model: projectName, nodes, assets: assets.map(({ name, size }) => ({ name, size })), meshes, linkConfigurations, jointValues, materialColor, opacity, showGrid }));
    setSaved(true); window.setTimeout(() => setSaved(false), 1500);
  }

  function exportUrdf() {
    const vector = (value: Vector3) => value.map(item => Number(item.toFixed(9))).join(' ');
    const linkXml = Object.entries(linkConfigurations).map(([linkName, config]) => {
      const collisionXml = config.collisions.map(collision => `    <collision name="${collision.name}">\n      <origin xyz="${vector(collision.position)}" rpy="${vector(collision.rotationRad)}"/>\n      <geometry><mesh filename="meshes/${collision.mesh}" scale="${vector(collision.scale)}"/></geometry>\n    </collision>`).join('\n');
      const i = config.inertial;
      return `  <link name="${linkName}">\n${collisionXml}\n    <inertial>\n      <origin xyz="${vector(i.position)}" rpy="${vector(i.rotationRad)}"/>\n      <mass value="${i.mass}"/>\n      <inertia ixx="${i.inertia.ixx}" ixy="${i.inertia.ixy}" ixz="${i.inertia.ixz}" iyy="${i.inertia.iyy}" iyz="${i.inertia.iyz}" izz="${i.inertia.izz}"/>\n    </inertial>\n  </link>`;
    }).join('\n');
    const blob = new Blob([`<?xml version="1.0"?>\n<robot name="Marvin_M6_S_CCS_696_V4">\n${linkXml}\n</robot>\n`], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'Marvin_M6_S_CCS_696_V4_edited.urdf'; anchor.click(); URL.revokeObjectURL(url);
    setImportMessage('URDF 已按当前 Collision / Inertial 配置生成');
  }

  return <div className="urdf-library" style={themeVars}>
    <input ref={urdfRef} type="file" accept=".urdf,.xml" hidden onChange={event => handleUrdf(event.target.files)} />
    <input ref={glbRef} type="file" accept=".glb,.stl,.dae,.obj" multiple hidden onChange={event => handleGlb(event.target.files)} />
    <input ref={textureRef} type="file" accept="image/*" hidden onChange={event => event.target.files?.[0] && setImportMessage(`贴图 ${event.target.files[0].name} 已应用`)} />
    {!editing ? <main className="ds-page ds-page--list urdf-list robot-library-list-page">
      <header className="urdf-list__head robot-library-list-header ds-page__header ds-page-header">
        <div className="robot-library-list-heading"><h1><AdaptiveText copy={{ standard: ui.title, short: ui.titleShort }} style={{ display: 'block', maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden' }} /></h1><p><AdaptiveText copy={{ standard: ui.description, short: ui.descriptionShort }} style={{ display: 'block', maxWidth: 620, whiteSpace: 'nowrap', overflow: 'hidden' }} /></p></div>
        <div className="urdf-list__tools robot-library-list-toolbar">
          <ArcoTextInput scope="robot" className="robot-library-list-search" icon={<Search size={14}/>} value={query} onChange={event => setQuery(event.target.value)} placeholder={ui.search} />
          <ArcoButton scope="robot" type="primary" icon={<Plus size={15}/>} onClick={startNewComponent}>{action.create}</ArcoButton>
        </div>
      </header>
      <section className="urdf-cards robot-library-card-grid robot-library-list-content">
        {(!query || 'Marvin 双臂机器人 URDF STL'.toLowerCase().includes(query.toLowerCase())) && <article className="urdf-card" onDoubleClick={openDemoComponent}>
          <div className="urdf-card__preview"><div className="urdf-card__status"><ArcoTag tone="success" size="small">{ui.configured}</ArcoTag></div><div className="urdf-card__robot"><span/><span/><span/><span/></div></div>
          <div className="urdf-card__body"><div className="urdf-card__title"><h2><AdaptiveText copy={{ standard: ui.model, short: ui.modelShort }} style={{ display: 'block', height: 26, maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden' }} /></h2><ArcoTag tone="accent" size="small">URDF</ArcoTag></div><p><AdaptiveText copy={{ standard: ui.modelDescription, short: ui.modelDescriptionShort }} style={{ display: 'block', height: 44, overflow: 'hidden' }} /></p><div className="urdf-card__meta"><span>{INITIAL_NODES.length} {ui.nodes}</span><span>{MARVIN_ASSETS.length} Mesh</span><span>{ui.loaded}</span></div></div>
          <footer className="urdf-card__footer"><ArcoTag size="small">Marvin M6-S-CCS-696</ArcoTag><ArcoButton scope="robot" size="small" onClick={openDemoComponent}>{action.edit}</ArcoButton></footer>
        </article>}
      </section>
    </main> : <main className="ds-page ds-page--editor urdf-editor">
      {importMessage && <div className="urdf-toast">{importMessage}</div>}
      <header className="urdf-topbar"><div className="urdf-topbar__group"><h1>{projectName}</h1>{projectMode === 'new' ? <ArcoTag tone="accent" size="small">{action.create}</ArcoTag> : <ArcoTag tone="accent" size="small">{e.dualArm}</ArcoTag>}<ArcoTag size="small">{nodes.length ? `URDF + ${assets.length} Mesh` : e.noUrdf}</ArcoTag></div><div className="urdf-topbar__group"><DropdownMenu><DropdownMenuTrigger asChild><ArcoButton scope="robot" type="outline" icon={<ArrowDownUp size={15}/>} trailingIcon={<ChevronDown size={13}/>}>{action.import} / {action.export}</ArcoButton></DropdownMenuTrigger><DropdownMenuContent align="end" sideOffset={8} collisionPadding={12} className="ds-context-menu"><DropdownMenuItem className="ds-context-menu__item" onSelect={() => urdfRef.current?.click()}><FileCode2 size={15}/>{action.import}</DropdownMenuItem><DropdownMenuItem className="ds-context-menu__item" disabled={!nodes.length} onSelect={exportUrdf}><Download size={15}/>{action.export}</DropdownMenuItem></DropdownMenuContent></DropdownMenu><ArcoButton scope="robot" type="outline" onClick={() => changeEditing(false)}>{e.exit}</ArcoButton><ArcoButton scope="robot" type="primary" icon={saved ? <Check size={16}/> : <Save size={16}/>} onClick={save}>{saved ? e.saved : action.save}</ArcoButton></div></header>
      <div className="urdf-workspace">
        <div className="urdf-left-sidebar">
          <aside className="urdf-panel urdf-assets-panel"><header className="urdf-panel__head"><h2>{e.assets}</h2><ArcoIconButton scope="robot" size="small" icon={<Search size={15}/>} aria-label={e.search} aria-expanded={assetSearchOpen} tooltip={e.search} onClick={() => { setAssetSearchOpen(current => !current); if (assetSearchOpen) setAssetQuery(''); }}/><ArcoIconButton scope="robot" size="small" icon={<FileUp size={15}/>} aria-label={e.uploadAsset} tooltip={e.uploadAsset} onClick={() => glbRef.current?.click()}/></header>{assetSearchOpen && <label className="urdf-tree-search"><Search size={14}/><ArcoTextInput scope="robot" autoFocus value={assetQuery} onChange={event => setAssetQuery(event.target.value)} placeholder={e.searchFiles} aria-label={e.searchFiles} /></label>}<div className="urdf-asset-list">{filteredAssets.length ? filteredAssets.map(asset => <div key={asset.name} className="urdf-asset-row" data-selected={previewAsset === asset.name} draggable onDragStart={event => { event.dataTransfer.effectAllowed = 'copy'; event.dataTransfer.setData('application/x-robot-asset', asset.name); }} onDoubleClick={() => attachAssetToLink(asset.name)}><button type="button" className="urdf-asset-row__main" onClick={() => setPreviewAsset(asset.name)}><span className="urdf-asset-row__icon"><FileBox size={15}/></span><span className="urdf-asset-row__text"><strong>{asset.name}</strong><small>{asset.size}</small></span></button><div className="urdf-asset-row__actions"><ArcoIconButton scope="robot" type="text" size="mini" icon={<Plus size={13}/>} aria-label={`${e.addToLink}: ${asset.name}`} tooltip={e.addToLink} onClick={() => attachAssetToLink(asset.name)}/><ArcoIconButton scope="robot" type="text" size="mini" icon={<Trash2 size={13}/>} aria-label={`${e.deleteAsset}: ${asset.name}`} tooltip={e.deleteAsset} onClick={() => removeAsset(asset.name)}/></div></div>) : <div className="urdf-panel-empty urdf-panel-empty--compact"><FileBox size={20}/><strong>{e.noAssets}</strong><span>{e.assetHelp}</span><ArcoButton scope="robot" size="small" onClick={() => glbRef.current?.click()}>{e.uploadMesh}</ArcoButton></div>}</div></aside>
          <aside className="urdf-panel urdf-structure-panel"><header className="urdf-panel__head"><h2>{e.structure}</h2><ArcoIconButton scope="robot" size="small" icon={<Search size={15}/>} aria-label={e.search} aria-expanded={structureSearchOpen} tooltip={e.search} onClick={() => { setStructureSearchOpen(current => !current); if (structureSearchOpen) setQuery(''); }}/><ArcoIconButton scope="robot" size="small" icon={<Plus size={16}/>} aria-label={e.addNode} tooltip={e.addNode} /></header>{structureSearchOpen && <label className="urdf-tree-search"><Search size={14}/><ArcoTextInput scope="robot" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Link / Joint" aria-label={e.search} /></label>}<div className="urdf-tree" role="tree">{filteredNodes.map((node) => {
          const sourceIndex = nodes.indexOf(node);
          const hasChildren = (nodes[sourceIndex + 1]?.depth ?? -1) > node.depth;
          const nodeExpanded = hasChildren && !collapsedNodes.has(node.id);
          return <div key={node.id} className="urdf-node" data-selected={selectedId === node.id} data-kind={node.kind} data-hidden={!node.visible} data-locked={node.locked} data-drop-target={dragOverNodeId === node.id} draggable={!node.locked} onDragStart={event => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('application/x-robot-node', node.id); }} onDragEnd={() => setDragOverNodeId('')} onDragOver={event => { if (node.kind !== 'link') return; event.preventDefault(); event.dataTransfer.dropEffect = event.dataTransfer.types.includes('application/x-robot-asset') ? 'copy' : 'move'; setDragOverNodeId(node.id); }} onDragLeave={() => setDragOverNodeId(current => current === node.id ? '' : current)} onDrop={event => { if (node.kind !== 'link') return; event.preventDefault(); const assetName = event.dataTransfer.getData('application/x-robot-asset'); const sourceId = event.dataTransfer.getData('application/x-robot-node'); if (assetName) attachAssetToLink(assetName, node.id); else if (sourceId) moveStructureNode(sourceId, node.id); setDragOverNodeId(''); }} style={{ paddingLeft: 6 + Math.min(node.depth, 8) * 8 }} role="treeitem" aria-selected={selectedId === node.id} aria-expanded={hasChildren ? nodeExpanded : undefined}>
            {hasChildren ? <button type="button" className="urdf-node__toggle" aria-label={`${nodeExpanded ? e.collapse : e.expand}: ${node.name}`} onClick={() => setCollapsedNodes(current => { const next = new Set(current); if (next.has(node.id)) next.delete(node.id); else next.add(node.id); return next; })}>{nodeExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</button> : <span className="urdf-node__toggle" />}
            <button type="button" className="urdf-node__main" onClick={() => { setSelectedId(node.id); if (node.kind === 'joint') setActiveJointId(node.name); const link = node.kind === 'link' ? node : [...nodes.slice(0, sourceIndex + 1)].reverse().find(item => item.kind === 'link'); if (link) setActiveCollisionId((linkConfigurations[link.id] ?? defaultLinkConfiguration(link.id)).collisions[0]?.id ?? ''); }}><span className="urdf-node__dot"/><span className="urdf-node__name">{node.name}</span>{(!node.visible || node.locked) && <span className="urdf-node__state">{!node.visible ? e.hidden : e.locked}</span>}</button>
            <DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="urdf-node__menu-trigger" aria-label={`${node.name} · ${e.actions}`}><MoreHorizontal size={15}/></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="ds-context-menu"><DropdownMenuItem className="ds-context-menu__item" onClick={() => toggleNode(node.id, 'visible')}>{node.visible ? <EyeOff size={14}/> : <Eye size={14}/>} {node.visible ? e.hideNode : e.showNode}</DropdownMenuItem><DropdownMenuItem className="ds-context-menu__item" onClick={() => toggleNode(node.id, 'locked')}>{node.locked ? <Unlock size={14}/> : <Lock size={14}/>} {node.locked ? e.unlock : e.lockNode}</DropdownMenuItem><DropdownMenuItem className="ds-context-menu__item" onClick={() => deleteStructureNode(node.id)}><Trash2 size={14}/>{e.deleteNode}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          </div>;
        })}{!filteredNodes.length && <div className="urdf-panel-empty"><Cuboid size={22}/><strong>{e.noStructure}</strong><span>{e.structureHelp}</span><ArcoButton scope="robot" size="small" onClick={() => urdfRef.current?.click()}>{e.importUrdf}</ArcoButton></div>}</div></aside>
          <aside className="urdf-panel urdf-joint-panel">
            <header className="urdf-joint-panel__head"><h2>{e.joints}</h2><div className="urdf-angle-unit" role="group" aria-label={e.jointUnit}><button type="button" data-selected={jointAngleUnit === 'deg'} aria-pressed={jointAngleUnit === 'deg'} onClick={() => setJointAngleUnit('deg')}>°</button><button type="button" data-selected={jointAngleUnit === 'rad'} aria-pressed={jointAngleUnit === 'rad'} onClick={() => setJointAngleUnit('rad')}>rad</button></div><ArcoIconButton scope="robot" type="text" size="small" icon={<Redo2 size={15}/>} aria-label={e.zero} tooltip={e.zero} disabled={!availableJoints.length} onClick={() => setJointValues(Object.fromEntries(availableJoints.map(joint => [joint.id, 0])))}/></header>
            <div className="urdf-joint-list">{availableJoints.length ? availableJoints.map(joint => {
              const unitScale = jointAngleUnit === 'deg' ? 180 / Math.PI : 1;
              const displayedValue = (jointValues[joint.id] ?? 0) * unitScale;
              const updateJoint = (value: number) => setJointValues(current => ({ ...current, [joint.id]: value / unitScale }));
              return <div key={joint.id} className="urdf-joint-row" data-selected={activeJointId === joint.id} onClick={() => { setActiveJointId(joint.id); setSelectedId(joint.id); }}><button type="button" className="urdf-joint-row__label" onClick={() => { setActiveJointId(joint.id); setSelectedId(joint.id); }}>{joint.name}</button><input aria-label={`${joint.id} · ${e.angle}`} type="range" min={joint.min * unitScale} max={joint.max * unitScale} step={jointAngleUnit === 'deg' ? 1 : 0.01} value={displayedValue} onChange={event => updateJoint(Number(event.target.value))}/><input className="urdf-joint-row__value" aria-label={`${joint.id} · ${e.currentAngle} (${jointAngleUnit})`} type="number" min={joint.min * unitScale} max={joint.max * unitScale} step={jointAngleUnit === 'deg' ? 1 : 0.01} value={Number(displayedValue.toFixed(jointAngleUnit === 'deg' ? 1 : 2))} onChange={event => updateJoint(Number(event.target.value))}/></div>;
            }) : <div className="urdf-panel-empty"><CircleDot size={22}/><strong>{e.noJoints}</strong><span>{e.jointHelp}</span></div>}</div>
          </aside>
        </div>
        <section className="urdf-scene">
          {projectMode === 'demo' ? <>
          <MarvinUrdfViewer ariaLabel={`Marvin · ${e.dualArm} · 3D`} modelUrl={`${MARVIN_MODEL_BASE}/glb/Marvin-Dual-Arm.glb`} mappingUrl={`${MARVIN_MODEL_BASE}/glb/joints.json`} selectedNode={selectedNode.kind === 'mesh' ? activeLinkNode.name : selectedNode.name} jointValues={jointValues} hiddenNodes={hiddenNodeIds} showGrid={showGrid} resetViewToken={resetViewToken} viewPreset={viewPreset} viewPresetToken={viewPresetToken} onSelectNode={handleViewerSelect} onSelectionInfo={handleSelectionInfo} onLoadState={handleViewerLoadState}/>
          {modelLoadState !== 'ready' && <div className="urdf-model-state" data-state={modelLoadState}>{modelLoadState === 'loading' ? <><span className="urdf-model-state__spinner"/>{e.loading}</> : <>{e.loadFailed}</>}</div>}
          <div className="urdf-scene__tools" role="toolbar" aria-label={e.sceneTools}><ArcoIconButton scope="robot" type="text" size="small" icon={<Maximize2 size={15}/>} aria-label={e.fit} tooltip={e.fit} onClick={() => setResetViewToken(current => current + 1)}/><ArcoIconToggleButton scope="robot" size="small" selected={showGrid} icon={<Grid3X3 size={15}/>} aria-label={showGrid ? e.hideGrid : e.showGrid} tooltip={showGrid ? e.hideGrid : e.showGrid} onClick={() => setShowGrid(current => !current)}/><ArcoIconToggleButton scope="robot" size="small" selected={interfaceOpen} icon={<RadioTower size={15}/>} aria-label={e.jointInterface} tooltip={e.jointInterface} onClick={() => setInterfaceOpen(current => !current)}/></div>
          {modelSelectionInfo && <section className="urdf-selection-hud" aria-label={e.selected}><header><span>{e.selected}</span><strong>{modelSelectionInfo.name}</strong><small>{modelSelectionInfo.type}</small></header><p>{modelSelectionInfo.meshes} Mesh · {modelSelectionInfo.vertices.toLocaleString()} {e.vertices} · {modelSelectionInfo.materials} {e.materials}</p><dl><div><dt>{e.world} X / Y / Z</dt><dd>{modelSelectionInfo.worldPosition.map(value => value.toFixed(3)).join(' / ')}</dd></div><div><dt>{e.bounds} X / Y / Z (m)</dt><dd>{modelSelectionInfo.size.map(value => value.toFixed(3)).join(' / ')}</dd></div></dl></section>}
          {previewAsset ? <div className="urdf-scene__asset"><FileBox size={13}/><span>{previewAsset}</span><small>{e.assetPreview}</small></div> : null}
          {interfaceOpen && <section className="urdf-interface-card" aria-label={x.liveInterface}><header><span><Activity size={15}/>{x.liveInterface}</span><button type="button" aria-label={x.closePanel} onClick={() => setInterfaceOpen(false)}><X size={14}/></button></header><div className="urdf-interface-card__fields"><label>{x.gateway}<input value={grpcUrl} onChange={event => setGrpcUrl(event.target.value)} placeholder={x.deviceAddress} /></label><label>{x.armScope}<select value={armScope} onChange={event => setArmScope(event.target.value as 'both' | '0' | '1')}><option value="both">{x.bothArms}</option><option value="0">{x.leftArm}</option><option value="1">{x.rightArm}</option></select></label></div><div className="urdf-interface-card__actions"><button type="button" onClick={() => void fetchRemoteJointStates()}><Wifi size={14}/>{x.getStatus}</button><button type="button" data-selected={continuousSync} onClick={() => setContinuousSync(current => !current)}>{continuousSync ? <WifiOff size={14}/> : <RadioTower size={14}/>} {continuousSync ? x.stopSync : x.keepSync}</button></div><footer data-error={Boolean(interfaceStatus) && /HTTP/i.test(interfaceStatus)}><span/>{interfaceStatus || x.notConnected}</footer></section>}
          <div className="urdf-view-gizmo" aria-label={x.viewSwitch}><span className="urdf-view-gizmo__axis urdf-view-gizmo__axis--x"/><span className="urdf-view-gizmo__axis urdf-view-gizmo__axis--y"/><span className="urdf-view-gizmo__axis urdf-view-gizmo__axis--z"/><button type="button" className="urdf-view-gizmo__center" data-selected={viewPreset === 'iso'} aria-label={x.switchTo.replace('{view}', x.isoView)} title={x.isoView} onClick={() => changeViewPreset('iso')}>3D</button>{(['x','y','z'] as const).map(axis => <button key={axis} type="button" className={`urdf-view-gizmo__point urdf-view-gizmo__point--${axis}`} data-selected={viewPreset === axis} aria-label={x.switchTo.replace('{view}', x.axisView.replace('{axis}', axis.toUpperCase()))} title={x.axisView.replace('{axis}', axis.toUpperCase())} onClick={() => changeViewPreset(axis)}>{axis.toUpperCase()}</button>)}</div>
          </> : <div className="urdf-new-scene"><div className="urdf-new-scene__grid"/><section className="urdf-onboarding"><ArcoTag tone="accent" size="small">{x.step.replace('{step}', !nodes.length ? '1' : !assets.length ? '2' : '3')}</ArcoTag><span className="urdf-onboarding__icon">{!nodes.length ? <FileCode2 size={24}/> : !assets.length ? <FileBox size={24}/> : <Cuboid size={24}/>}</span><h2>{!nodes.length ? x.startUrdf : !assets.length ? x.addMeshNext : x.resourcesReady}</h2><p>{!nodes.length ? x.urdfHelp : !assets.length ? x.meshHelp.replace('{links}', String(nodes.filter(node => node.kind === 'link').length)).replace('{joints}', String(nodes.filter(node => node.kind === 'joint').length)) : x.readyHelp}</p><div className="urdf-onboarding__steps"><span data-complete={nodes.length > 0}>{x.stepUrdf}</span><span data-complete={assets.length > 0}>{x.stepMesh}</span><span>{x.stepEdit}</span></div>{!nodes.length ? <ArcoButton scope="robot" type="primary" icon={<FileCode2 size={15}/>} onClick={() => urdfRef.current?.click()}>{x.chooseUrdf}</ArcoButton> : !assets.length ? <ArcoButton scope="robot" type="primary" icon={<Upload size={15}/>} onClick={() => glbRef.current?.click()}>{x.uploadMeshFile}</ArcoButton> : <ArcoButton scope="robot" onClick={() => setSelectedId(nodes.find(node => node.kind === 'link')?.id ?? '')}>{x.chooseFirstLink}</ArcoButton>}</section></div>}
        </section>
        <aside className="urdf-panel urdf-properties">{nodes.length ? <><nav className="ds-status-tabs urdf-property-tabs" role="tablist" aria-label={`${activeLinkNode.name} · ${e.actions}`}>{propertyTabs.map((item, index) => <button key={item.key} className="ds-status-tab" role="tab" aria-selected={tab === item.key} tabIndex={tab === item.key ? 0 : -1} onClick={() => setTab(item.key)} onKeyDown={event => handlePropertyTabKeyDown(event, index)}>{item.label}</button>)}</nav>
          <div className="urdf-properties__body">{tab === 'visual' ? <>
            <section className="urdf-section"><div className="urdf-section__head"><h3>{e.meshGrid} ({meshes.length})</h3><button onClick={() => glbRef.current?.click()}>+ {e.addMesh}</button></div>{meshes.map(mesh => <div key={mesh.id} className="urdf-mesh" data-selected={activeMeshId === mesh.id} onClick={() => setActiveMeshId(mesh.id)}><span className="urdf-mesh__icon"><Box size={15}/></span><span className="urdf-mesh__text"><strong>{mesh.name}</strong><span>{mesh.size}</span></span><button className="urdf-node__action" aria-label={e.deleteAsset} title={e.deleteAsset} onClick={event => { event.stopPropagation(); setMeshes(current => current.filter(item => item.id !== mesh.id)); }}><Trash2 size={12}/></button></div>)}</section>
            {selectedMesh && <><section className="urdf-section"><div className="urdf-section__head"><h3>{e.scale}</h3></div><NumericTriplet value={selectedMesh.scale} onChange={scale => updateMesh({ scale })}/><label className="urdf-field">{e.linkOrigin}<NumericTriplet value={selectedMesh.position} onChange={position => updateMesh({ position })}/></label></section>
            <section className="urdf-section"><div className="urdf-section__head"><h3>{e.rotation}</h3></div><ArcoSelect scope="robot" value={rotationMode} onChange={event => setRotationMode(event.target.value as RotationMode)}><option value="euler">{e.euler}</option><option value="radian">{e.radian}</option><option value="quaternion">{e.quaternion}</option></ArcoSelect><label className="urdf-field">{rotationMode === 'euler' ? 'Roll / Pitch / Yaw' : rotationMode === 'radian' ? 'Rx / Ry / Rz' : 'Qx / Qy / Qz'}<NumericTriplet value={selectedMesh.rotation} onChange={rotation => updateMesh({ rotation })} labels={rotationMode === 'euler' ? ['R','P','Y'] : ['X','Y','Z']} step={rotationMode === 'euler' ? 1 : 0.01}/></label><div className="urdf-quick">{[-90,90,180].map(angle => <button key={angle} onClick={() => updateMesh({ rotation: [selectedMesh.rotation[0], selectedMesh.rotation[1], angle] })}>{angle > 0 ? '+' : ''}{angle}°</button>)}</div></section>
            <section className="urdf-section"><div className="urdf-section__head"><h3>{e.material}</h3></div><label className="urdf-field">{e.color}<div className="urdf-color"><input type="color" value={materialColor} onChange={event => setMaterialColor(event.target.value)}/><input value={materialColor.toUpperCase()} onChange={event => setMaterialColor(event.target.value)}/><span>{opacity}%</span></div></label><label className="urdf-field">{e.opacity}<input type="range" min="0" max="100" value={opacity} onChange={event => setOpacity(Number(event.target.value))}/></label><ArcoButton scope="robot" long icon={<ImageIcon size={14}/>} onClick={() => textureRef.current?.click()}>{e.uploadTexture}</ArcoButton></section></>}
          </> : tab === 'collision' ? <>
            <section className="urdf-section"><div className="urdf-section__head"><h3>{e.collision} ({activeLinkConfig.collisions.length})</h3><button type="button" onClick={addCollision}>+ {e.addCollision}</button></div><div className="urdf-collision-list">{activeLinkConfig.collisions.map(collision => <div key={collision.id} className="urdf-collision-row" data-selected={activeCollision?.id === collision.id} onClick={() => setActiveCollisionId(collision.id)}><span className="urdf-mesh__icon"><Layers3 size={14}/></span><span className="urdf-mesh__text"><strong>{collision.name}</strong><span>{collision.mesh || e.noMesh}</span></span><button type="button" className="urdf-node__action" aria-label={collision.visible ? e.hideCollision : e.showCollision} title={collision.visible ? e.hideCollision : e.showCollision} onClick={event => { event.stopPropagation(); updateActiveLinkConfig(current => ({ ...current, collisions: current.collisions.map(item => item.id === collision.id ? { ...item, visible: !item.visible } : item) })); }}>{collision.visible ? <Eye size={13}/> : <EyeOff size={13}/>}</button><button type="button" className="urdf-node__action" aria-label={e.deleteCollision} title={e.deleteCollision} onClick={event => { event.stopPropagation(); deleteCollision(collision.id); }}><Trash2 size={13}/></button></div>)}</div></section>
            {activeCollision ? <>
              <section className="urdf-section"><div className="urdf-section__head"><h3>{e.geometry}</h3></div><label className="urdf-field">{e.name}<ArcoTextInput scope="robot" value={activeCollision.name} onChange={event => updateActiveCollision({ name: event.target.value })}/></label><label className="urdf-field">{e.geometryType}<ArcoSelect scope="robot" value="mesh" disabled><option value="mesh">{e.meshGrid}</option></ArcoSelect></label><label className="urdf-field">{e.selectMesh}<ArcoSelect scope="robot" value={activeCollision.mesh} onChange={event => { updateActiveCollision({ mesh: event.target.value }); setPreviewAsset(event.target.value); }}>{assets.map(asset => <option key={asset.name} value={asset.name}>{asset.name}</option>)}</ArcoSelect></label><div className="urdf-selected-asset"><FileBox size={17}/><span><strong>{activeCollision.mesh || e.noMesh}</strong><small>{e.collisionFile}</small></span><ArcoIconButton scope="robot" size="small" icon={<Upload size={14}/>} aria-label={e.uploadNewMesh} tooltip={e.uploadNewMesh} onClick={() => glbRef.current?.click()}/></div></section>
              <section className="urdf-section"><div className="urdf-section__head"><h3>{e.meshScale}</h3></div><NumericTriplet value={activeCollision.scale} onChange={scale => updateActiveCollision({ scale })} step={0.01}/></section>
              <section className="urdf-section"><div className="urdf-section__head"><h3>Collision Origin</h3></div><label className="urdf-field">{e.positionRelative.replace('Link', activeLinkId)}<NumericTriplet value={activeCollision.position} onChange={position => updateActiveCollision({ position })} step={0.001}/></label><label className="urdf-field">{e.rotationPose}<RotationEditor mode={activeCollision.rotationMode} value={activeCollision.rotationRad} onModeChange={rotationMode => updateActiveCollision({ rotationMode })} onChange={rotationRad => updateActiveCollision({ rotationRad })}/></label></section>
            </> : <div className="urdf-placeholder">{e.collisionEmpty}</div>}
          </> : <>
            <section className="urdf-section"><div className="urdf-section__head"><h3>{e.inertialFrame}</h3></div><label className="urdf-field">{e.referenceFrame}<ArcoSelect scope="robot" value={activeLinkConfig.inertial.reference} onChange={event => updateInertial({ reference: event.target.value })}>{nodes.filter(node => node.kind === 'joint').map(node => <option key={node.id} value={node.name}>{node.name}</option>)}</ArcoSelect></label><div className="urdf-reference"><CircleDot size={14}/><span>{e.currentReference}</span><strong>{activeLinkConfig.inertial.reference}</strong></div></section>
            <section className="urdf-section"><div className="urdf-section__head"><h3>Inertial Origin</h3></div><label className="urdf-field">{e.position}<NumericTriplet value={activeLinkConfig.inertial.position} onChange={position => updateInertial({ position })} step={0.001}/></label><label className="urdf-field">{e.rotationPose}<RotationEditor mode={activeLinkConfig.inertial.rotationMode} value={activeLinkConfig.inertial.rotationRad} onModeChange={rotationMode => updateInertial({ rotationMode })} onChange={rotationRad => updateInertial({ rotationRad })}/></label></section>
            <section className="urdf-section"><div className="urdf-section__head"><h3>{e.massCenter}</h3></div><label className="urdf-field">{e.mass}<ArcoTextInput scope="robot" type="number" min="0" step="0.001" value={activeLinkConfig.inertial.mass} onChange={event => updateInertial({ mass: Math.max(0, Number(event.target.value) || 0) })}/></label><label className="urdf-field">{e.center}<NumericTriplet value={activeLinkConfig.inertial.center} onChange={center => updateInertial({ center })} step={0.001}/></label></section>
            <section className="urdf-section"><div className="urdf-section__head"><h3>{e.inertia}</h3></div><div className="urdf-inertia-grid">{(['ixx','ixy','ixz','iyy','iyz','izz'] as const).map(key => <label key={key}><span>{key}</span><input type="number" step="0.00000001" value={activeLinkConfig.inertial.inertia[key]} onChange={event => updateInertial({ inertia: { ...activeLinkConfig.inertial.inertia, [key]: Number(event.target.value) || 0 } })}/></label>)}</div></section>
            <section className="urdf-section"><div className="urdf-section__head"><h3>{e.derived}</h3></div><label className="urdf-field">{e.density}<ArcoTextInput scope="robot" value={activeLinkConfig.inertial.density} placeholder={e.numeric} onChange={event => updateInertial({ density: event.target.value })}/></label><label className="urdf-field">{e.moments}<NumericTriplet value={activeLinkConfig.inertial.principalMoments} labels={['I1','I2','I3']} step={0.000001} onChange={principalMoments => updateInertial({ principalMoments })}/></label><div className="urdf-field">{e.axes}<div className="urdf-axis-matrix">{activeLinkConfig.inertial.principalAxes.map((axis, index) => <div key={index}><span>A{index + 1}</span><NumericTriplet value={axis} onChange={nextAxis => { const principalAxes = activeLinkConfig.inertial.principalAxes.map((item, axisIndex) => axisIndex === index ? nextAxis : item) as [Vector3, Vector3, Vector3]; updateInertial({ principalAxes }); }} step={0.001}/></div>)}</div></div></section>
          </>}</div></> : <div className="urdf-properties-empty"><span><Cuboid size={24}/></span><h2>{e.waiting}</h2><p>{e.waitingHelp}</p></div>}
        </aside>
      </div>
    </main>}
  </div>;
}

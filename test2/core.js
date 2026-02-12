/**
 * ═══════════════════════════════════════════════════════════════
 * 🧠 CORE.JS - สมองกลางของ Engineering Workspace
 * ═══════════════════════════════════════════════════════════════
 * 
 * ไฟล์นี้เป็นศูนย์กลางในการจัดการ:
 * 1. 📡 การสื่อสารระหว่างหน้า (Event Bus)
 * 2. 💾 การเก็บข้อมูล (LocalStorage)
 * 3. 🔍 การค้นหาข้อมูล (Global Search)
 * 4. 🗄️ การจัดการไฟล์ (IndexedDB)
 * 5. 🛠️ ฟังก์ชันช่วยเหลือต่างๆ (Utilities)
 */

(function () {
    // สร้าง Object ชื่อ Core ไว้เก็บฟังก์ชันต่างๆ
    const Core = (window.Core = window.Core || {});

    // ═══════════════════════════════════════════════════════════════
    // 📡 ส่วนที่ 1: EVENT BUS - ระบบส่งข้อความระหว่างหน้า
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * BroadcastChannel ช่วยให้หน้า HTML ต่างๆ (ใน iframe) 
     * สามารถส่งข้อความหากันได้แบบ Real-time
     * 
     * ตัวอย่างการใช้งาน:
     * - หน้า A: Core.Bus.emit('task_added', taskData)
     * - หน้า B: Core.Bus.on('task_added', (data) => { แสดงงานใหม่ })
     */
    const busChannel = new BroadcastChannel('eng_workspace_channel');
    
    Core.Bus = {
        /**
         * ส่งข้อความไปยังหน้าอื่นๆ
         * @param {string} eventName - ชื่อเหตุการณ์ (เช่น 'task_updated')
         * @param {any} data - ข้อมูลที่ต้องการส่ง
         */
        emit(eventName, data) {
            busChannel.postMessage({ 
                event: eventName, 
                data: data 
            });
            console.log(`📡 [Event Emitted] ${eventName}`, data);
        },
        
        /**
         * รับฟังข้อความจากหน้าอื่นๆ
         * @param {string} eventName - ชื่อเหตุการณ์ที่ต้องการฟัง
         * @param {function} callback - ฟังก์ชันที่จะทำงานเมื่อได้รับข้อความ
         */
        on(eventName, callback) {
            busChannel.addEventListener('message', (e) => {
                if (e.data && e.data.event === eventName) {
                    console.log(`📩 [Event Received] ${eventName}`, e.data.data);
                    callback(e.data.data);
                }
            });
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 💾 ส่วนที่ 2: STORAGE - จัดการข้อมูลใน LocalStorage
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * LocalStorage เป็นที่เก็บข้อมูลในเบราว์เซอร์
     * - ข้อมูลจะอยู่ตลอดแม้ปิดเบราว์เซอร์
     * - เก็บได้เฉพาะข้อความ (String) เท่านั้น
     * - จำกัดขนาด ~5-10 MB
     */
    Core.Storage = {
        /**
         * อ่านข้อมูลจาก LocalStorage
         * @param {string} key - ชื่อคีย์ (เช่น 'myTasks')
         * @param {any} fallback - ค่าเริ่มต้นถ้าไม่มีข้อมูล
         * @returns {any} ข้อมูลที่อ่านได้
         */
        get(key, fallback = null) {
            try {
                // อ่านข้อมูลจาก LocalStorage
                const rawData = localStorage.getItem(key);
                
                // ถ้าไม่มีข้อมูล คืนค่า fallback
                if (!rawData || rawData === "undefined" || rawData === "null") {
                    return fallback;
                }
                
                // แปลง JSON String กลับเป็น Object/Array
                return JSON.parse(rawData);
                
            } catch (error) {
                console.error(`❌ [Storage Error] ไม่สามารถอ่าน ${key}:`, error);
                return fallback;
            }
        },
        
        /**
         * บันทึกข้อมูลลง LocalStorage
         * @param {string} key - ชื่อคีย์
         * @param {any} value - ข้อมูลที่ต้องการบันทึก (Object, Array, String, Number)
         * @param {string|null} notifyEvent - ชื่อ Event ที่ต้องการแจ้งเตือนหน้าอื่น (optional)
         */
        set(key, value, notifyEvent = null) {
            try {
                // แปลงข้อมูลเป็น JSON String
                const jsonString = JSON.stringify(value);
                
                // บันทึกลง LocalStorage
                localStorage.setItem(key, jsonString);
                
                console.log(`✅ [Storage] บันทึก ${key} สำเร็จ`);
                
                // ถ้าระบุ Event ให้แจ้งเตือนหน้าอื่นๆ
                if (notifyEvent) {
                    Core.Bus.emit(notifyEvent, value);
                }
                
            } catch (error) {
                console.error(`❌ [Storage Error] ไม่สามารถบันทึก ${key}:`, error);
                
                // ถ้าเมมโมรี่เต็ม
                if (error.name === 'QuotaExceededError') {
                    alert(
                        "⚠️ เมมโมรี่เต็ม! (LocalStorage Full)\n" +
                        "กรุณาลบข้อมูลเก่าหรือ Backup ข้อมูลออกไปก่อน"
                    );
                }
            }
        },
        
        /**
         * ลบข้อมูลออกจาก LocalStorage
         * @param {string} key - ชื่อคีย์ที่ต้องการลบ
         */
        remove(key) {
            localStorage.removeItem(key);
            console.log(`🗑️ [Storage] ลบ ${key} แล้ว`);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 🔍 ส่วนที่ 3: SEARCH - ค้นหาข้อมูลทั่วระบบ
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * ฟังก์ชันค้นหาข้อมูลจาก Tasks, Notes, Todos
     */
    Core.Search = {
        /**
         * ค้นหาข้อมูล
         * @param {string} query - คำค้นหา
         * @returns {Array} ผลลัพธ์ที่เจอ
         */
        execute(query) {
            // ถ้าไม่มีคำค้นหา
            if (!query) return [];
            
            const searchTerm = query.toLowerCase(); // แปลงเป็นตัวพิมพ์เล็ก
            const results = []; // เก็บผลลัพธ์
            
            console.log(`🔍 [Search] กำลังค้นหา: "${query}"`);

            // ──────────────────────────────────────────────────────
            // 1️⃣ ค้นหาจาก Tasks (งานต่างๆ)
            // ──────────────────────────────────────────────────────
            const tasks = Core.Storage.get('myTasksV5', []);
            tasks.forEach(task => {
                // ตรวจสอบว่าคำค้นหาอยู่ใน title หรือ remark หรือไม่
                const matchTitle = task.title.toLowerCase().includes(searchTerm);
                const matchRemark = task.remark && task.remark.toLowerCase().includes(searchTerm);
                
                if (matchTitle || matchRemark) {
                    results.push({
                        type: 'Task',           // ประเภท
                        title: task.title,      // ชื่อ
                        subtitle: task.status,  // สถานะ
                        link: 'tasks.html',     // ลิงก์ไปยังหน้า
                        id: task.id             // ID
                    });
                }
            });

            // ──────────────────────────────────────────────────────
            // 2️⃣ ค้นหาจาก Notes (บันทึก)
            // ──────────────────────────────────────────────────────
            const notes = Core.Storage.get('myNotes', []);
            notes.forEach(note => {
                const matchTitle = note.title.toLowerCase().includes(searchTerm);
                const matchContent = note.content.toLowerCase().includes(searchTerm);
                
                if (matchTitle || matchContent) {
                    results.push({
                        type: 'Note',
                        title: note.title,
                        subtitle: note.tags || 'ทั่วไป',
                        link: 'notes.html',
                        id: note.id
                    });
                }
            });

            // ──────────────────────────────────────────────────────
            // 3️⃣ ค้นหาจาก Todos (รายการสิ่งที่ต้องทำ)
            // ──────────────────────────────────────────────────────
            const todos = Core.Storage.get('myQuickTodos', []);
            todos.forEach(todo => {
                if (todo.title.toLowerCase().includes(searchTerm)) {
                    results.push({
                        type: 'To-Do',
                        title: todo.title,
                        subtitle: todo.status,
                        link: 'todo.html',
                        id: todo.id
                    });
                }
            });

            console.log(`✅ [Search] เจอ ${results.length} รายการ`);
            return results;
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 🗄️ ส่วนที่ 4: DATABASE - จัดการไฟล์ใหญ่ (IndexedDB)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * IndexedDB ใช้เก็บไฟล์ขนาดใหญ่ (รูป, PDF, วิดีโอ)
     * - เก็บได้หลายร้อย MB
     * - เก็บเป็น Binary (Blob)
     */
    
    const DB_CONFIG = {
        name: 'FileManagerDB_V6',
        version: 1,
        storeName: 'files'
    };
    
    let databaseInstance = null; // เก็บ instance ของ Database

    Core.DB = {
        /**
         * เริ่มต้น/เปิด Database
         * @returns {Promise<IDBDatabase|null>}
         */
        init() {
            return new Promise((resolve, reject) => {
                // ถ้าเปิดแล้ว ไม่ต้องเปิดใหม่
                if (databaseInstance) {
                    return resolve(databaseInstance);
                }
                
                // ตรวจสอบว่า Browser รองรับ IndexedDB หรือไม่
                if (!window.indexedDB) {
                    console.warn("⚠️ Browser ไม่รองรับ IndexedDB");
                    return resolve(null);
                }
                
                console.log(`🗄️ [DB] กำลังเปิด Database...`);
                
                // เปิด Database
                const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
                
                // สร้างตารางครั้งแรก (ถ้ายังไม่มี)
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    
                    if (!db.objectStoreNames.contains(DB_CONFIG.storeName)) {
                        db.createObjectStore(DB_CONFIG.storeName, { keyPath: 'id' });
                        console.log(`✅ [DB] สร้างตาราง '${DB_CONFIG.storeName}' แล้ว`);
                    }
                };
                
                // เปิดสำเร็จ
                request.onsuccess = (event) => {
                    databaseInstance = event.target.result;
                    console.log(`✅ [DB] เปิด Database สำเร็จ`);
                    resolve(databaseInstance);
                };
                
                // เปิดไม่สำเร็จ
                request.onerror = (event) => {
                    console.error(`❌ [DB] เปิด Database ไม่สำเร็จ:`, event);
                    reject(event);
                };
            });
        },
        
        /**
         * บันทึกไฟล์
         * @param {string} id - ID ของไฟล์
         * @param {Blob} fileBlob - ไฟล์ต้นฉบับ
         * @param {Blob} previewBlob - ไฟล์ตัวอย่าง (thumbnail)
         * @returns {Promise<boolean>}
         */
        async saveFile(id, fileBlob, previewBlob) {
            try {
                const db = await this.init();
                if (!db) return false;
                
                return new Promise((resolve) => {
                    console.log(`💾 [DB] กำลังบันทึกไฟล์ ID: ${id}`);
                    
                    const transaction = db.transaction([DB_CONFIG.storeName], 'readwrite');
                    const store = transaction.objectStore(DB_CONFIG.storeName);
                    
                    // บันทึกข้อมูล
                    store.put({
                        id: id,
                        fileBlob: fileBlob,
                        previewBlob: previewBlob,
                        created: Date.now()
                    });
                    
                    transaction.oncomplete = () => {
                        console.log(`✅ [DB] บันทึกไฟล์สำเร็จ`);
                        Core.Bus.emit('files_updated'); // แจ้งเตือนหน้าอื่น
                        resolve(true);
                    };
                });
                
            } catch (error) {
                console.error(`❌ [DB] บันทึกไฟล์ไม่สำเร็จ:`, error);
                return false;
            }
        },
        
        /**
         * อ่านไฟล์
         * @param {string} id - ID ของไฟล์
         * @returns {Promise<Object|null>}
         */
        async getFile(id) {
            try {
                const db = await this.init();
                if (!db) return null;
                
                return new Promise((resolve) => {
                    console.log(`📖 [DB] กำลังอ่านไฟล์ ID: ${id}`);
                    
                    const transaction = db.transaction([DB_CONFIG.storeName], 'readonly');
                    const store = transaction.objectStore(DB_CONFIG.storeName);
                    const request = store.get(id);
                    
                    request.onsuccess = () => {
                        const result = request.result || null;
                        console.log(result ? `✅ [DB] อ่านไฟล์สำเร็จ` : `⚠️ [DB] ไม่พบไฟล์`);
                        resolve(result);
                    };
                    
                    request.onerror = () => {
                        console.error(`❌ [DB] อ่านไฟล์ไม่สำเร็จ`);
                        resolve(null);
                    };
                });
                
            } catch (error) {
                console.error(`❌ [DB] อ่านไฟล์ผิดพลาด:`, error);
                return null;
            }
        },
        
        /**
         * ลบไฟล์
         * @param {string} id - ID ของไฟล์
         * @returns {Promise<boolean>}
         */
        async deleteFile(id) {
            try {
                const db = await this.init();
                if (!db) return false;
                
                return new Promise((resolve) => {
                    console.log(`🗑️ [DB] กำลังลบไฟล์ ID: ${id}`);
                    
                    const transaction = db.transaction([DB_CONFIG.storeName], 'readwrite');
                    const store = transaction.objectStore(DB_CONFIG.storeName);
                    store.delete(id);
                    
                    transaction.oncomplete = () => {
                        console.log(`✅ [DB] ลบไฟล์สำเร็จ`);
                        Core.Bus.emit('files_updated'); // แจ้งเตือนหน้าอื่น
                        resolve(true);
                    };
                });
                
            } catch (error) {
                console.error(`❌ [DB] ลบไฟล์ไม่สำเร็จ:`, error);
                return false;
            }
        },
        
        /**
         * ลบไฟล์ทั้งหมด
         */
        async clearAll() {
            console.log(`🗑️ [DB] กำลังลบไฟล์ทั้งหมด...`);
            const db = await this.init();
            if (db) {
                const transaction = db.transaction([DB_CONFIG.storeName], 'readwrite');
                transaction.objectStore(DB_CONFIG.storeName).clear();
                console.log(`✅ [DB] ลบไฟล์ทั้งหมดแล้ว`);
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 🛠️ ส่วนที่ 5: UTILITIES - ฟังก์ชันช่วยเหลือต่างๆ
    // ═══════════════════════════════════════════════════════════════
    
    Core.Util = {
        /**
         * สร้าง ID ที่ไม่ซ้ำกัน
         * @param {string} prefix - คำนำหน้า (เช่น 'task_')
         * @returns {string} ID ใหม่
         */
        generateId: (prefix = '') => {
            const timestamp = Date.now(); // เวลาปัจจุบัน
            const random = Math.floor(Math.random() * 1000); // เลขสุ่ม
            return `${prefix}${timestamp}${random}`;
        },
        
        /**
         * ดึงวันที่วันนี้ในรูปแบบ YYYY-MM-DD
         * @returns {string} วันที่ (เช่น '2026-02-09')
         */
        todayISO: () => {
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000; // แปลง timezone
            const localDate = new Date(now.getTime() - offset);
            return localDate.toISOString().split('T')[0];
        },
        
        /**
         * นำทางไปหน้าอื่น
         * @param {string} page - ชื่อหน้า (เช่น 'tasks.html')
         * @param {string} title - ชื่อหน้า
         */
        navigate: (page, title) => {
            // ถ้าอยู่ใน iframe ให้บอกหน้าหลัก
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ 
                    action: 'navigate', 
                    page: page, 
                    title: title 
                }, '*');
            } else {
                // ถ้าไม่ใช่ iframe ให้ไปหน้าตรงๆ
                window.location.href = page;
            }
        },
        
        /**
         * แสดงการแจ้งเตือนบน Desktop
         * @param {string} title - หัวข้อ
         * @param {string} body - เนื้อหา
         */
        notify: (title, body) => {
            // ตรวจสอบว่า Browser รองรับ Notification หรือไม่
            if (!("Notification" in window)) {
                console.warn("⚠️ Browser ไม่รองรับ Notification");
                return;
            }
            
            // ถ้าได้รับอนุญาตแล้ว
            if (Notification.permission === "granted") {
                new Notification(title, { 
                    body: body, 
                    icon: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png' 
                });
            } 
            // ถ้ายังไม่ได้ขออนุญาต
            else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        new Notification(title, { body: body });
                    }
                });
            }
        }
    };
    
    console.log("✅ Core.js โหลดเรียบร้อยแล้ว!");
})();

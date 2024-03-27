

    /*-------------------------------------思路---------------------------------------*/
    /*-----------------創建一些div存放input的checkbox跟label---------------------------*/
    /*---------------select取值並放入div,並隱藏原始select元素---------------------------*/
    /*--------------添加點擊事件 修改css樣式來改變checkbox勾選狀態-----------------------*/
    /*---------------------創建span來添加勾選的文本內容並顯示更新------------------------*/
    /*----------------------------開啟跟關閉選單---------------------------------------*/
    /*-----------------新增文本最大值限制、移除選項按鈕 並初始化預設值--------------------*/
    /*------------------------------------reload--------------------------------------*/
    /*-----------------------表單提交添加監聽  取值轉換成字串 提交到後端------------------*/



    function MultiselectDropdown(options) {

        //初始化選單
        const config = {
            height: '10rem',
            placeholder: '下拉選單',

        };

        //定義一個 newElement 的函式，用來創建新的 HTML 元素並設定屬性。

        function newElement(tag, attrs) {
            const e = document.createElement(tag);
            if (attrs) {
                for (const [key, value] of Object.entries(attrs)) {
                    if (key === 'class') {
                        // 如果是 class，則將其添加到 class 列表中
                        if (Array.isArray(value)) {
                            value.filter(Boolean).forEach(cls => e.classList.add(cls));
                        } else if (value) {
                            e.classList.add(value);
                        }
                    } else if (key === 'style') {
                        // 如果是 style，則將其應用到元素的樣式中
                        for (const [ks, vs] of Object.entries(value)) {
                            e.style[ks] = vs;
                        }
                    } else if (key === 'text') {
                        // 如果是 text，則將其設置為元素的文本內容
                        e.textContent = value || '\u00A0';
                    } else {
                        // 將其他屬性直接設置給元素
                        e[key] = value;
                    }
                }
            }
            return e;
        }


        // 選取所有有 multiple 屬性的 select 元素，並對每個元素執行後續操作
        document.querySelectorAll("select[multiple]").forEach((el, k) => {

            // 創建一個包含下拉選單的 div 元素
            const div = newElement('div', { class: 'multiselect-dropdown', style: { width: config.style?.width ?? el.clientWidth + 'px', padding: config.style?.padding ?? '' } });
            // 隱藏原始的 select 元素
            el.style.display = 'none';
            // 將新創建的 div 插入到 select 元素之後
            el.parentNode.insertBefore(div, el.nextSibling);
            // 創建包含選項列表的 div 元素外層容器。包含所有的選項，並控制列表的顯示和隱藏。
            const listWrap = newElement('div', { class: 'multiselect-dropdown-list-wrapper' });
            //創建一個新的 <div> 元素作為實際的選項列表。這個元素將包含所有可選擇的選項。
            const list = newElement('div', { class: 'multiselect-dropdown-list', style: { height: config.height } });
            //項列表的外層容器添加到多選下拉式選單的主容器 div 中。這樣，選項列表將被包含在多選下拉式選單的外觀範圍內。
            div.appendChild(listWrap);
            //將選項列表添加到外層容器中。所有的選項將被包含在 listWrap 的內部，而 listWrap 控制了列表的顯示和隱藏。
            listWrap.appendChild(list);

            // loadOptions 方法用於加載選項
            el.loadOptions = () => {
                list.innerHTML = '';



                // 加入各個選項 ,對所有選項進行處理
                //遍歷 select 元素中的每個選項。
                for (let i = 0; i < el.options.length; i++) {
                    //select 元素的第 i 個選項）賦值給變數 o，方便後續操作。
                    const o = el.options[i];
                    //創建一個新的 div 元素作為選項的表示。如果該選項已被選擇，則給該 div 元素添加 checked 類別
                    const op = newElement('div', { class: o.selected ? 'checked' : '', optEl: o })
                    //創建一個 input 元素，類型為 checkbox，並根據該選項是否已選擇來設置其 checked 屬性。
                    const ic = newElement('input', { type: 'checkbox', checked: o.selected });
                    //創建的 input 元素添加到選項的 div 元素中，以便用戶可以通過勾選框選擇該選項。
                    op.appendChild(ic);
                    //選項文本的 label 元素添加到選項的 div 元素中，以便顯示選項的文本內容。
                    op.appendChild(newElement('label', { text: o.text }));

                    // 選項的點擊事件處理
                    op.addEventListener('click', () => {
                        //切換選項的選中狀態
                        op.classList.toggle('checked');
                        //切換選項前面的勾選框的選中狀態
                        op.querySelector("input").checked = !op.querySelector("input").checked;
                        //切換原始 select 元素中對應選項的選中狀態。
                        op.optEl.selected = !!!op.optEl.selected;
                        //觸發 select 元素的 change 事件
                        el.dispatchEvent(new Event('change'));


                    });
                    //勾選框元素添加點擊事件監聽器，當勾選框被點擊時切換其選中狀態。
                    ic.addEventListener('click', (ev) => {
                        ic.checked = !ic.checked;
                    });
                    //div 元素賦值給原始 select 元素的 listitemEl 屬性
                    o.listitemEl = op;
                    list.appendChild(op);

                }
                //將包含選項列表的 div 元素賦值給外框 div 元素的 listEl 屬性
                div.listEl = listWrap;


                // 更新選擇狀態

                div.refresh = () => {
                    //取所有具有 optext 或 placeholder 類的 <span> 元素，並 forEach 迭代每個元素，將它們從 div 中移除。清空目前顯示的選擇狀態或占位符。
                    div.querySelectorAll('span.optext, span.placeholder').forEach(t => div.removeChild(t));
                    //行程式碼將 el 元素（原始的 <select> 元素）中被選中的選項轉換為陣列 sels。
                    const sels = Array.from(el.selectedOptions);
                    //查選擇的選項數量是否超過指定的最大數量。
                    if (sels.length > (el.attributes['multiselect-max-items']?.value ?? 6)) {
                        //在 div 中添加一個新的 <span> 元素，顯示已選擇的選項數量。
                        div.appendChild(newElement('span', { class: ['optext', 'maxselected'], text: sels.length + ' ' + config.txtSelected }));
                    } else {
                        //選項數量未超過指定的最大數量，則使用迴圈遍歷已選擇的每個選項。
                        for (let i = 0; i < sels.length; i++) {
                            const x = sels[i];
                            //創建一個新的 <span> 元素來顯示選項的文本內容。
                            const c = newElement('span', { class: 'optext', text: x.text, srcOption: x });
                            //未設置 multiselect-hide-x 屬性為 true，則選項添加一個可點擊的 "🗙" 按鈕，用移除該選項。呼叫 div.refresh() 來更新顯示。
                            if ((el.attributes['multiselect-hide-x']?.value !== 'true')) {
                                //創建了一個新的 <span> 元素，用於顯示移除選項的按鈕。按鈕的文本是 '🗙'，並且設置了 optdel 類別和 config.txtRemove 的標題文字（可能是移除選項的提示文字）
                                const delSpan = newElement('span', { class: 'optdel', text: '🗙', title: config.txtRemove });
                                //設置移除按鈕點擊。點擊時觸發對應listitemEl元素，然後重新呼叫 div.refresh() 來更新顯示，最後停止事件的傳播，以防止觸發其他元素的點擊事件。
                                delSpan.onclick = (ev) => { c.srcOption.listitemEl.dispatchEvent(new Event('click')); div.refresh(); ev.stopPropagation(); };
                                //移除按鈕元素添加到選項的 <span> 元素中，使其顯示在選項文本的旁邊。
                                c.appendChild(delSpan);
                            }
                            div.appendChild(c);
                        }
                    }

                    //如果沒有選擇任何選項，則添加一個占位符元素，顯示在未選擇時的預設文本。
                    if (0 == el.selectedOptions.length) div.appendChild(newElement('span', { class: 'placeholder', text: el.attributes['placeholder']?.value ?? config.placeholder }));
                };
                div.refresh();

                // 在表單提交時，將選擇的選項值動態地添加到一個隱藏的 input 元素中
                let hiddenInput;
                const submitHandler = (event) => {
                    //獲取到 el 元素中被選取的選項,使用 map 方法將每個選項的值取出，最後轉換為陣列。
                    const selectedValues = Array.from(el.selectedOptions).map(option => option.value);     
                    //創建了一個新的 input 元素，用於存放將要提交的選取值。        
                    hiddenInput = document.createElement('input');
                    //設置了 input 元素的類型為 hidden
                    hiddenInput.type = 'hidden';
                    //確保表單提交時可以正確識別這個 input 元素。
                    hiddenInput.name = el.name; // 使用原始 select 元素的 name 屬性
                    //轉換的選取值陣列轉換為 JSON 格式的字串，並將其設置為 input 元素的值。
                    hiddenInput.value = JSON.stringify(selectedValues);
                    //input 元素添加到 el 元素所在的表單中。表單提交時，將 input 元素的值提交到後端。
                    el.form.appendChild(hiddenInput);
                };

                //表單提交事件監聽。表單提交時，執行 submitHandler()，完成選取值的處理和添加 input 元素的動作。

                el.form.addEventListener('submit', submitHandler);


            }
            el.loadOptions();

            



            // 點擊下拉選單的事件處理
            div.addEventListener('click', () => {
                div.listEl.style.display = 'block';
            });

            // 點擊式窗以外的地方關閉列表選單
            document.addEventListener('click', function (event) {
                if (!div.contains(event.target)) {
                    listWrap.style.display = 'none';
                    div.refresh();
                }
            });

        });



    };



    //頁面加載完成後，初始化多選下拉式選單
    window.addEventListener('load', () => {
        MultiselectDropdown(window.MultiselectDropdownOptions);
    });


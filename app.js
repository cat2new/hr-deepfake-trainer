'use strict';
const cases = [
 {title:'Уточняющий вопрос',context:'После рассказа о проекте рекрутер задаёт новый вопрос. Сравните два ответа и движения губ во второй реплике.',transcript:'HR: «Над чем вы работали?» Кандидат: «Я сделал отчёт для команды». HR: «Какую метрику вы отслеживали?» Снова звучит та же фраза с той же интонацией. Во время повтора губы неподвижны.',signal:0,action:1,actions:['Отклонить кандидата и указать в карточке «дипфейк».','Приостановить этап и назначить повторную проверку через контакт из исходной заявки.','Считать повтор обычным волнением и согласовать доступ.'],evidence:'В сцене имитируется подмена звуковой дорожки. На новый вопрос дословно повторяется старая запись, а губы во время повтора неподвижны.',why:'Двух наблюдений достаточно, чтобы перепроверить ситуацию по согласованному каналу. Обвинение или допуск к системам были бы преждевременными.'},
 {title:'Связь восстановилась',context:'Во время ответа портится изображение. Обратите внимание, что происходит после восстановления связи.',transcript:'HR спрашивает о метрике. Изображение рассыпается на пиксели. Кандидат сообщает о проблеме со связью. После восстановления на вопрос «Сейчас меня слышно?» отвечает: «Да. Я отслеживала сроки доставки».',signal:1,action:2,actions:['Занести кандидата в список подозрительных из-за помех.','Попросить прислать паспорт в личный мессенджер.','Продолжить интервью и пройти обычные этапы проверки.'],evidence:'В этом сценарии смоделирован сбой связи. После него изображение стабильно, кандидат отвечает по смыслу на заданный вопрос.',why:'Помехи сами по себе не дают основания отклонить кандидата. Стандартные проверки при найме всё равно нужны.'},
 {title:'Звонок без камеры',context:'У кандидата работает только аудио. Решите, какое заключение допускает запись.',transcript:'Вместо видео видна иконка. HR просит включить камеру. Кандидат отвечает, что она не работает, и соглашается перенести звонок через исходное приглашение.',signal:2,action:0,actions:['Согласовать повторную или доступную альтернативную проверку через исходное приглашение.','Подтвердить личность по убедительному звучанию голоса.','Указать, что голос синтезирован, и завершить отбор.'],evidence:'Изображения нет. По короткому аудиофрагменту нельзя определить, совпадают ли речь и мимика или кому принадлежит голос.',why:'Используйте ранее согласованный канал и предложите доступную альтернативу. Отсутствие камеры само по себе ничего не доказывает.'}
];
const signals=['Есть признаки возможной подмены.','Вероятен обычный технический сбой.','Данных для оценки недостаточно.'];
const byId = id => document.getElementById(id);
let index=0;
const answers=[];
function progress(){
 byId('progress').innerHTML=cases.map((_,i)=>'<div class="step '+(i<=index?'on':'')+'" '+(i===index?'aria-current="step"':'')+'>'+ (i<index?'✓ ':'')+'Звонок '+(i+1)+'</div>').join('');
}
function group(name,heading,items){
 return '<fieldset><legend>'+heading+'</legend>'+items.map((x,i)=>'<label><input required type="radio" name="'+name+'" value="'+i+'"><span>'+x+'</span></label>').join('')+'</fieldset>';
}
function renderCase(){
 progress();const c=cases[index], n=index+1;
 byId('app').innerHTML='<div class="grid"><article class="card"><p class="kicker">Видеофрагмент '+n+' из 3</p><h2>'+c.title+'</h2><video controls playsinline preload="metadata" poster="media/case'+n+'.jpg" aria-label="Учебный звонок '+n+'"><source src="media/case'+n+'.webm" type="video/webm"><source src="media/case'+n+'.mp4" type="video/mp4"></video><p class="context">'+c.context+'</p><details><summary>Текстовая версия звонка</summary><p>'+c.transcript+'</p></details></article><article class="card"><p class="kicker">Решение рекрутера</p><h2>Как вы поступите?</h2><div id="decision"><form id="quiz">'+group('signal','1. Что видно или слышно?',signals)+group('action','2. Какой следующий шаг?',c.actions)+'<button disabled>Проверить ответ</button></form></div></article></div>';
 const form=byId('quiz');
 form.onchange=()=>{form.querySelector('button').disabled=!(form.elements.signal.value && form.elements.action.value)};
 form.onsubmit=e=>{e.preventDefault();if(answers.length!==index||!form.checkValidity())return;const a={signal:Number(form.elements.signal.value),action:Number(form.elements.action.value)};answers.push(a);showFeedback(c,a)};
}
function showFeedback(c,a){
 const entry=(correct,title,chosen,expected,detail)=>'<div class="note '+(correct?'':'bad')+'"><strong>'+title+' · '+(correct?'верно':'стоит пересмотреть')+'</strong><p>Ваш ответ: '+chosen+'</p>'+(!correct?'<p><b>Верный ответ:</b> '+expected+'</p>':'')+'<p>'+detail+'</p></div>';
 byId('decision').innerHTML='<div role="status" tabindex="-1" id="feedback">'+entry(a.signal===c.signal,'Наблюдение',signals[a.signal],signals[c.signal],c.evidence)+entry(a.action===c.action,'Действие',c.actions[a.action],c.actions[c.action],c.why)+'</div><button id="next">'+(index===2?'Посмотреть результат':'Следующий звонок')+'</button>';
 byId('feedback').focus();byId('next').onclick=()=>{index++;if(index<cases.length){renderCase();jump()}else{renderResult();jump()}};
}
function jump(){document.querySelector('h1').focus();window.scrollTo(0,0)}
function renderResult(){
 progress();const correct=(k)=>answers.filter((a,i)=>a[k]===cases[i][k]).length;
 document.querySelector('h1').textContent='Результат практикума';byId('intro').textContent='Каждое наблюдение и каждое действие дают по одному баллу.';
 byId('app').innerHTML='<article class="card results"><p class="kicker">Учебная попытка</p><div class="big">'+(correct('signal')+correct('action'))+' / 6</div><p>Верных наблюдений: '+correct('signal')+' из 3. Безопасных действий: '+correct('action')+' из 3.</p>'+cases.map((c,i)=>'<div class="resultrow"><strong>'+c.title+'</strong><p>Наблюдение '+(answers[i].signal===c.signal?'✓':'✗')+' &nbsp; Действие '+(answers[i].action===c.action?'✓':'✗')+'</p><p>'+c.actions[c.action]+'</p></div>').join('')+'<button id="again">Пройти ещё раз</button></article>';
 byId('again').onclick=()=>{index=0;answers.length=0;document.querySelector('h1').textContent='Собеседование под наблюдением';byId('intro').textContent='Посмотрите учебный звонок, оцените признаки подмены и выберите следующий шаг.';renderCase();jump()};
}
renderCase();

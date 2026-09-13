import {spawn,execFileSync} from 'node:child_process';
const args=process.argv.slice(2);
const vite=spawn('npm',['run','dev','--',...args],{stdio:'inherit',shell:true});
let busy=false;
const check=()=>{if(busy)return;busy=true;try{
 execFileSync('git',['fetch','origin','main'],{stdio:'ignore'});
 const local=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const remote=execFileSync('git',['rev-parse','origin/main'],{encoding:'utf8'}).trim();
 const dirty=execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim();
 if(local!==remote&&!dirty){execFileSync('git',['merge','--ff-only','origin/main'],{stdio:'inherit'});console.log('\n[DepthCut] GitHub update pulled. Vite HMR will reload.');}
 else if(local!==remote&&dirty)console.log('\n[DepthCut] Remote update found; local changes exist, so auto-pull was skipped.');
}catch(e){console.log('[DepthCut] auto-pull check skipped:',e.message)}finally{busy=false}};
const timer=setInterval(check,20000);check();
const stop=()=>{clearInterval(timer);vite.kill('SIGINT');process.exit(0)};
process.on('SIGINT',stop);process.on('SIGTERM',stop);
vite.on('exit',code=>{clearInterval(timer);process.exit(code??0)});

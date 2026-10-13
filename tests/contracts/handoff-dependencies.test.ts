import {describe, expect, it} from 'vitest'
import {makeFixture, planContent, runCli, write} from './ignite-fixture'

describe('Handoff admission',()=>{
  it('[AC-EXECUTION-050] refuses missing upstream prerequisites in a standalone task packet',()=>{
    const fixture=makeFixture()
    try{
      write(fixture.root,'docs/plans/upstream.md',planContent(fixture.baseCommit,{id:'IGT-901',status:'draft'}))
      write(fixture.root,'docs/plans/fixture.md',planContent(fixture.baseCommit,{
        depends_on:['IGT-901'],
        tasks:[{id:'worker',title:'Consume upstream contract',phase:'implement',status:'todo',owner:'consumer',scope:['README.md'],acceptance:['AC-TEST-001']}],
      }))
      const result=runCli(fixture.root,'next','--plan','IGT-900','--task','worker','--handoff')
      expect(result.status,result.stderr).toBe(0)
      expect(JSON.parse(result.stdout).blockers).toContain('dependency IGT-901 is not done')
    }finally{fixture.cleanup()}
  })
})

(module
 (type $i32_i32_i32_i32_=>_none (func (param i32 i32 i32 i32)))
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (type $i32_f64_f64_f64_=>_f64 (func (param i32 f64 f64 f64) (result f64)))
 (type $i32_i32_i32_i32_=>_f64 (func (param i32 i32 i32 i32) (result f64)))
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (global $~lib/memory/__stack_pointer (mut i32) (i32.const 19660))
 (memory $0 1)
 (data (i32.const 1036) "\1c\08")
 (data (i32.const 1053) "\08\00\00\97\00\00\00\a0\00\00\00\89\00\00\00[\00\00\00Z\00\00\00\0f\00\00\00\83\00\00\00\r\00\00\00\c9\00\00\00_\00\00\00`\00\00\005\00\00\00\c2\00\00\00\e9\00\00\00\07\00\00\00\e1\00\00\00\8c\00\00\00$\00\00\00g\00\00\00\1e\00\00\00E\00\00\00\8e\00\00\00\08\00\00\00c\00\00\00%\00\00\00\f0\00\00\00\15\00\00\00\n\00\00\00\17\00\00\00\be\00\00\00\06\00\00\00\94\00\00\00\f7\00\00\00x\00\00\00\ea\00\00\00K\00\00\00\00\00\00\00\1a\00\00\00\c5\00\00\00>\00\00\00^\00\00\00\fc\00\00\00\db\00\00\00\cb\00\00\00u\00\00\00#\00\00\00\0b\00\00\00 \00\00\009\00\00\00\b1\00\00\00!\00\00\00X\00\00\00\ed\00\00\00\95\00\00\008\00\00\00W\00\00\00\ae\00\00\00\14\00\00\00}\00\00\00\88\00\00\00\ab\00\00\00\a8\00\00\00D\00\00\00\af\00\00\00J\00\00\00\a5\00\00\00G\00\00\00\86\00\00\00\8b\00\00\000\00\00\00\1b\00\00\00\a6\00\00\00M\00\00\00\92\00\00\00\9e\00\00\00\e7\00\00\00S\00\00\00o\00\00\00\e5\00\00\00z\00\00\00<\00\00\00\d3\00\00\00\85\00\00\00\e6\00\00\00\dc\00\00\00i\00\00\00\\\00\00\00)\00\00\007\00\00\00.\00\00\00\f5\00\00\00(\00\00\00\f4\00\00\00f\00\00\00\8f\00\00\006\00\00\00A\00\00\00\19\00\00\00?\00\00\00\a1\00\00\00\01\00\00\00\d8\00\00\00P\00\00\00I\00\00\00\d1\00\00\00L\00\00\00\84\00\00\00\bb\00\00\00\d0\00\00\00Y\00\00\00\12\00\00\00\a9\00\00\00\c8\00\00\00\c4\00\00\00\87\00\00\00\82\00\00\00t\00\00\00\bc\00\00\00\9f\00\00\00V\00\00\00\a4\00\00\00d\00\00\00m\00\00\00\c6\00\00\00\ad\00\00\00\ba\00\00\00\03\00\00\00@\00\00\004\00\00\00\d9\00\00\00\e2\00\00\00\fa\00\00\00|\00\00\00{\00\00\00\05\00\00\00\ca\00\00\00&\00\00\00\93\00\00\00v\00\00\00~\00\00\00\ff\00\00\00R\00\00\00U\00\00\00\d4\00\00\00\cf\00\00\00\ce\00\00\00;\00\00\00\e3\00\00\00/\00\00\00\10\00\00\00:\00\00\00\11\00\00\00\b6\00\00\00\bd\00\00\00\1c\00\00\00*\00\00\00\df\00\00\00\b7\00\00\00\aa\00\00\00\d5\00\00\00w\00\00\00\f8\00\00\00\98\00\00\00\02\00\00\00,\00\00\00\9a\00\00\00\a3\00\00\00F\00\00\00\dd\00\00\00\99\00\00\00e\00\00\00\9b\00\00\00\a7\00\00\00+\00\00\00\ac\00\00\00\t\00\00\00\81\00\00\00\16\00\00\00\'\00\00\00\fd\00\00\00\13\00\00\00b\00\00\00l\00\00\00n\00\00\00O\00\00\00q\00\00\00\e0\00\00\00\e8\00\00\00\b2\00\00\00\b9\00\00\00p\00\00\00h\00\00\00\da\00\00\00\f6\00\00\00a\00\00\00\e4\00\00\00\fb\00\00\00\"\00\00\00\f2\00\00\00\c1\00\00\00\ee\00\00\00\d2\00\00\00\90\00\00\00\0c\00\00\00\bf\00\00\00\b3\00\00\00\a2\00\00\00\f1\00\00\00Q\00\00\003\00\00\00\91\00\00\00\eb\00\00\00\f9\00\00\00\0e\00\00\00\ef\00\00\00k\00\00\001\00\00\00\c0\00\00\00\d6\00\00\00\1f\00\00\00\b5\00\00\00\c7\00\00\00j\00\00\00\9d\00\00\00\b8\00\00\00T\00\00\00\cc\00\00\00\b0\00\00\00s\00\00\00y\00\00\002\00\00\00-\00\00\00\7f\00\00\00\04\00\00\00\96\00\00\00\fe\00\00\00\8a\00\00\00\ec\00\00\00\cd\00\00\00]\00\00\00\de\00\00\00r\00\00\00C\00\00\00\1d\00\00\00\18\00\00\00H\00\00\00\f3\00\00\00\8d\00\00\00\80\00\00\00\c3\00\00\00N\00\00\00B\00\00\00\d7\00\00\00=\00\00\00\9c\00\00\00\b4\00\00\00\97\00\00\00\a0\00\00\00\89\00\00\00[\00\00\00Z\00\00\00\0f\00\00\00\83\00\00\00\r\00\00\00\c9\00\00\00_\00\00\00`\00\00\005\00\00\00\c2\00\00\00\e9\00\00\00\07\00\00\00\e1\00\00\00\8c\00\00\00$\00\00\00g\00\00\00\1e\00\00\00E\00\00\00\8e\00\00\00\08\00\00\00c\00\00\00%\00\00\00\f0\00\00\00\15\00\00\00\n\00\00\00\17\00\00\00\be\00\00\00\06\00\00\00\94\00\00\00\f7\00\00\00x\00\00\00\ea\00\00\00K\00\00\00\00\00\00\00\1a\00\00\00\c5\00\00\00>\00\00\00^\00\00\00\fc\00\00\00\db\00\00\00\cb\00\00\00u\00\00\00#\00\00\00\0b\00\00\00 \00\00\009\00\00\00\b1\00\00\00!\00\00\00X\00\00\00\ed\00\00\00\95\00\00\008\00\00\00W\00\00\00\ae\00\00\00\14\00\00\00}\00\00\00\88\00\00\00\ab\00\00\00\a8\00\00\00D\00\00\00\af\00\00\00J\00\00\00\a5\00\00\00G\00\00\00\86\00\00\00\8b\00\00\000\00\00\00\1b\00\00\00\a6\00\00\00M\00\00\00\92\00\00\00\9e\00\00\00\e7\00\00\00S\00\00\00o\00\00\00\e5\00\00\00z\00\00\00<\00\00\00\d3\00\00\00\85\00\00\00\e6\00\00\00\dc\00\00\00i\00\00\00\\\00\00\00)\00\00\007\00\00\00.\00\00\00\f5\00\00\00(\00\00\00\f4\00\00\00f\00\00\00\8f\00\00\006\00\00\00A\00\00\00\19\00\00\00?\00\00\00\a1\00\00\00\01\00\00\00\d8\00\00\00P\00\00\00I\00\00\00\d1\00\00\00L\00\00\00\84\00\00\00\bb\00\00\00\d0\00\00\00Y\00\00\00\12\00\00\00\a9\00\00\00\c8\00\00\00\c4\00\00\00\87\00\00\00\82\00\00\00t\00\00\00\bc\00\00\00\9f\00\00\00V\00\00\00\a4\00\00\00d\00\00\00m\00\00\00\c6\00\00\00\ad\00\00\00\ba\00\00\00\03\00\00\00@\00\00\004\00\00\00\d9\00\00\00\e2\00\00\00\fa\00\00\00|\00\00\00{\00\00\00\05\00\00\00\ca\00\00\00&\00\00\00\93\00\00\00v\00\00\00~\00\00\00\ff\00\00\00R\00\00\00U\00\00\00\d4\00\00\00\cf\00\00\00\ce\00\00\00;\00\00\00\e3\00\00\00/\00\00\00\10\00\00\00:\00\00\00\11\00\00\00\b6\00\00\00\bd\00\00\00\1c\00\00\00*\00\00\00\df\00\00\00\b7\00\00\00\aa\00\00\00\d5\00\00\00w\00\00\00\f8\00\00\00\98\00\00\00\02\00\00\00,\00\00\00\9a\00\00\00\a3\00\00\00F\00\00\00\dd\00\00\00\99\00\00\00e\00\00\00\9b\00\00\00\a7\00\00\00+\00\00\00\ac\00\00\00\t\00\00\00\81\00\00\00\16\00\00\00\'\00\00\00\fd\00\00\00\13\00\00\00b\00\00\00l\00\00\00n\00\00\00O\00\00\00q\00\00\00\e0\00\00\00\e8\00\00\00\b2\00\00\00\b9\00\00\00p\00\00\00h\00\00\00\da\00\00\00\f6\00\00\00a\00\00\00\e4\00\00\00\fb\00\00\00\"\00\00\00\f2\00\00\00\c1\00\00\00\ee\00\00\00\d2\00\00\00\90\00\00\00\0c\00\00\00\bf\00\00\00\b3\00\00\00\a2\00\00\00\f1\00\00\00Q\00\00\003\00\00\00\91\00\00\00\eb\00\00\00\f9\00\00\00\0e\00\00\00\ef\00\00\00k\00\00\001\00\00\00\c0\00\00\00\d6\00\00\00\1f\00\00\00\b5\00\00\00\c7\00\00\00j\00\00\00\9d\00\00\00\b8\00\00\00T\00\00\00\cc\00\00\00\b0\00\00\00s\00\00\00y\00\00\002\00\00\00-\00\00\00\7f\00\00\00\04\00\00\00\96\00\00\00\fe\00\00\00\8a\00\00\00\ec\00\00\00\cd\00\00\00]\00\00\00\de\00\00\00r\00\00\00C\00\00\00\1d\00\00\00\18\00\00\00H\00\00\00\f3\00\00\00\8d\00\00\00\80\00\00\00\c3\00\00\00N\00\00\00B\00\00\00\d7\00\00\00=\00\00\00\9c\00\00\00\b4")
 (data (i32.const 3116) ",")
 (data (i32.const 3128) "\03\00\00\00\10\00\00\00 \04\00\00 \04\00\00\00\08\00\00\00\02")
 (data (i32.const 3164) "<")
 (data (i32.const 3176) "\01\00\00\00$\00\00\00I\00n\00d\00e\00x\00 \00o\00u\00t\00 \00o\00f\00 \00r\00a\00n\00g\00e")
 (data (i32.const 3228) ",")
 (data (i32.const 3240) "\01\00\00\00\1a\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00.\00t\00s")
 (export "perlin" (func $assembly/perlin/perlin))
 (export "memory" (memory $0))
 (func $~lib/array/Array<i32>#__get (param $0 i32) (result i32)
  local.get $0
  i32.const 3148
  i32.load $0
  i32.ge_u
  if
   i32.const 3184
   i32.const 3248
   i32.const 114
   i32.const 42
   call $~lib/builtins/abort
   unreachable
  end
  i32.const 3140
  i32.load $0
  local.get $0
  i32.const 2
  i32.shl
  i32.add
  i32.load $0
 )
 (func $assembly/perlin/grad (param $0 i32) (param $1 f64) (param $2 f64) (param $3 f64) (result f64)
  block $case16|0
   block $case15|0
    block $case14|0
     block $case13|0
      block $case12|0
       block $case11|0
        block $case10|0
         block $case9|0
          block $case8|0
           block $case7|0
            block $case6|0
             block $case5|0
              block $case4|0
               block $case3|0
                block $case2|0
                 block $case1|0
                  block $case0|0
                   local.get $0
                   i32.const 15
                   i32.and
                   br_table $case0|0 $case1|0 $case2|0 $case3|0 $case4|0 $case5|0 $case6|0 $case7|0 $case8|0 $case9|0 $case10|0 $case11|0 $case12|0 $case13|0 $case14|0 $case15|0 $case16|0
                  end
                  local.get $1
                  local.get $2
                  f64.add
                  return
                 end
                 local.get $2
                 local.get $1
                 f64.sub
                 return
                end
                local.get $1
                local.get $2
                f64.sub
                return
               end
               local.get $1
               f64.neg
               local.get $2
               f64.sub
               return
              end
              local.get $1
              local.get $3
              f64.add
              return
             end
             local.get $3
             local.get $1
             f64.sub
             return
            end
            local.get $1
            local.get $3
            f64.sub
            return
           end
           local.get $1
           f64.neg
           local.get $3
           f64.sub
           return
          end
          local.get $2
          local.get $3
          f64.add
          return
         end
         local.get $3
         local.get $2
         f64.sub
         return
        end
        local.get $2
        local.get $3
        f64.sub
        return
       end
       local.get $2
       f64.neg
       local.get $3
       f64.sub
       return
      end
      local.get $2
      local.get $1
      f64.add
      return
     end
     local.get $3
     local.get $2
     f64.sub
     return
    end
    local.get $2
    local.get $1
    f64.sub
    return
   end
   local.get $2
   f64.neg
   local.get $3
   f64.sub
   return
  end
  f64.const 0
 )
 (func $assembly/perlin/perlin (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result f64)
  (local $4 f64)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  (local $8 f64)
  (local $9 f64)
  (local $10 f64)
  (local $11 f64)
  (local $12 f64)
  (local $13 f64)
  (local $14 f64)
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.sub
  global.set $~lib/memory/__stack_pointer
  global.get $~lib/memory/__stack_pointer
  i32.const 3276
  i32.lt_s
  if
   i32.const 19680
   i32.const 19728
   i32.const 1
   i32.const 1
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/memory/__stack_pointer
  local.tee $7
  i32.const 0
  i32.store $0
  local.get $7
  i32.const 3136
  i32.store $0
  local.get $0
  f64.convert_i32_s
  local.get $3
  f64.convert_i32_s
  local.tee $4
  f64.div
  local.tee $5
  f64.floor
  local.tee $6
  i32.trunc_sat_f64_s
  i32.const 255
  i32.and
  local.tee $0
  call $~lib/array/Array<i32>#__get
  local.get $1
  f64.convert_i32_s
  local.get $4
  f64.div
  local.tee $8
  f64.floor
  local.tee $9
  i32.trunc_sat_f64_s
  i32.const 255
  i32.and
  local.tee $1
  i32.add
  local.set $3
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $3
  call $~lib/array/Array<i32>#__get
  local.get $2
  f64.convert_i32_s
  local.get $4
  f64.div
  local.tee $4
  f64.floor
  local.tee $10
  i32.trunc_sat_f64_s
  i32.const 255
  i32.and
  local.tee $2
  i32.add
  local.set $7
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $3
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $2
  i32.add
  local.set $3
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $0
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $1
  i32.add
  local.set $0
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $0
  call $~lib/array/Array<i32>#__get
  local.get $2
  i32.add
  local.set $1
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $0
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $2
  i32.add
  local.set $0
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $7
  call $~lib/array/Array<i32>#__get
  local.get $5
  local.get $6
  f64.sub
  local.tee $11
  local.get $8
  local.get $9
  f64.sub
  local.tee $8
  local.get $4
  local.get $10
  f64.sub
  local.tee $9
  call $assembly/perlin/grad
  local.set $5
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $5
  local.get $11
  local.get $11
  f64.mul
  local.get $11
  f64.mul
  local.get $11
  local.get $11
  f64.const 6
  f64.mul
  f64.const -15
  f64.add
  f64.mul
  f64.const 10
  f64.add
  f64.mul
  local.tee $10
  local.get $1
  call $~lib/array/Array<i32>#__get
  local.get $11
  f64.const -1
  f64.add
  local.tee $4
  local.get $8
  local.get $9
  call $assembly/perlin/grad
  local.get $5
  f64.sub
  f64.mul
  f64.add
  local.set $6
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $3
  call $~lib/array/Array<i32>#__get
  local.get $11
  local.get $8
  f64.const -1
  f64.add
  local.tee $5
  local.get $9
  call $assembly/perlin/grad
  local.set $12
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $6
  local.get $8
  local.get $8
  f64.mul
  local.get $8
  f64.mul
  local.get $8
  local.get $8
  f64.const 6
  f64.mul
  f64.const -15
  f64.add
  f64.mul
  f64.const 10
  f64.add
  f64.mul
  local.tee $13
  local.get $12
  local.get $10
  local.get $0
  call $~lib/array/Array<i32>#__get
  local.get $4
  local.get $5
  local.get $9
  call $assembly/perlin/grad
  local.get $12
  f64.sub
  f64.mul
  f64.add
  local.get $6
  f64.sub
  f64.mul
  f64.add
  local.set $12
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $7
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $11
  local.get $8
  local.get $9
  f64.const -1
  f64.add
  local.tee $6
  call $assembly/perlin/grad
  local.set $14
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $14
  local.get $10
  local.get $1
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $4
  local.get $8
  local.get $6
  call $assembly/perlin/grad
  local.get $14
  f64.sub
  f64.mul
  f64.add
  local.set $8
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $3
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $11
  local.get $5
  local.get $6
  call $assembly/perlin/grad
  local.set $11
  global.get $~lib/memory/__stack_pointer
  i32.const 3136
  i32.store $0
  local.get $12
  local.get $9
  local.get $9
  f64.mul
  local.get $9
  f64.mul
  local.get $9
  local.get $9
  f64.const 6
  f64.mul
  f64.const -15
  f64.add
  f64.mul
  f64.const 10
  f64.add
  f64.mul
  local.get $8
  local.get $13
  local.get $11
  local.get $10
  local.get $0
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $4
  local.get $5
  local.get $6
  call $assembly/perlin/grad
  local.get $11
  f64.sub
  f64.mul
  f64.add
  local.get $8
  f64.sub
  f64.mul
  f64.add
  local.get $12
  f64.sub
  f64.mul
  f64.add
  f64.const 1
  f64.add
  f64.const 0.5
  f64.mul
  local.set $4
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.add
  global.set $~lib/memory/__stack_pointer
  local.get $4
 )
)

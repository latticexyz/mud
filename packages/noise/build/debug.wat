(module
 (type $f64_=>_f64 (func (param f64) (result f64)))
 (type $i32_i32_i32_i32_=>_none (func (param i32 i32 i32 i32)))
 (type $i32_i32_=>_i32 (func (param i32 i32) (result i32)))
 (type $i32_f64_f64_f64_=>_f64 (func (param i32 f64 f64 f64) (result f64)))
 (type $f64_f64_f64_=>_f64 (func (param f64 f64 f64) (result f64)))
 (type $none_=>_none (func))
 (type $i32_i32_i32_i32_=>_f64 (func (param i32 i32 i32 i32) (result f64)))
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (global $assembly/perlin/p i32 (i32.const 2112))
 (global $~lib/shared/runtime/Runtime.Stub i32 (i32.const 0))
 (global $~lib/shared/runtime/Runtime.Minimal i32 (i32.const 1))
 (global $~lib/shared/runtime/Runtime.Incremental i32 (i32.const 2))
 (global $~lib/memory/__data_end i32 (i32.const 2252))
 (global $~lib/memory/__stack_pointer (mut i32) (i32.const 18636))
 (global $~lib/memory/__heap_base i32 (i32.const 18636))
 (memory $0 1)
 (data (i32.const 12) "\1c\08\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\08\00\00\97\00\00\00\a0\00\00\00\89\00\00\00[\00\00\00Z\00\00\00\0f\00\00\00\83\00\00\00\0d\00\00\00\c9\00\00\00_\00\00\00`\00\00\005\00\00\00\c2\00\00\00\e9\00\00\00\07\00\00\00\e1\00\00\00\8c\00\00\00$\00\00\00g\00\00\00\1e\00\00\00E\00\00\00\8e\00\00\00\08\00\00\00c\00\00\00%\00\00\00\f0\00\00\00\15\00\00\00\n\00\00\00\17\00\00\00\be\00\00\00\06\00\00\00\94\00\00\00\f7\00\00\00x\00\00\00\ea\00\00\00K\00\00\00\00\00\00\00\1a\00\00\00\c5\00\00\00>\00\00\00^\00\00\00\fc\00\00\00\db\00\00\00\cb\00\00\00u\00\00\00#\00\00\00\0b\00\00\00 \00\00\009\00\00\00\b1\00\00\00!\00\00\00X\00\00\00\ed\00\00\00\95\00\00\008\00\00\00W\00\00\00\ae\00\00\00\14\00\00\00}\00\00\00\88\00\00\00\ab\00\00\00\a8\00\00\00D\00\00\00\af\00\00\00J\00\00\00\a5\00\00\00G\00\00\00\86\00\00\00\8b\00\00\000\00\00\00\1b\00\00\00\a6\00\00\00M\00\00\00\92\00\00\00\9e\00\00\00\e7\00\00\00S\00\00\00o\00\00\00\e5\00\00\00z\00\00\00<\00\00\00\d3\00\00\00\85\00\00\00\e6\00\00\00\dc\00\00\00i\00\00\00\\\00\00\00)\00\00\007\00\00\00.\00\00\00\f5\00\00\00(\00\00\00\f4\00\00\00f\00\00\00\8f\00\00\006\00\00\00A\00\00\00\19\00\00\00?\00\00\00\a1\00\00\00\01\00\00\00\d8\00\00\00P\00\00\00I\00\00\00\d1\00\00\00L\00\00\00\84\00\00\00\bb\00\00\00\d0\00\00\00Y\00\00\00\12\00\00\00\a9\00\00\00\c8\00\00\00\c4\00\00\00\87\00\00\00\82\00\00\00t\00\00\00\bc\00\00\00\9f\00\00\00V\00\00\00\a4\00\00\00d\00\00\00m\00\00\00\c6\00\00\00\ad\00\00\00\ba\00\00\00\03\00\00\00@\00\00\004\00\00\00\d9\00\00\00\e2\00\00\00\fa\00\00\00|\00\00\00{\00\00\00\05\00\00\00\ca\00\00\00&\00\00\00\93\00\00\00v\00\00\00~\00\00\00\ff\00\00\00R\00\00\00U\00\00\00\d4\00\00\00\cf\00\00\00\ce\00\00\00;\00\00\00\e3\00\00\00/\00\00\00\10\00\00\00:\00\00\00\11\00\00\00\b6\00\00\00\bd\00\00\00\1c\00\00\00*\00\00\00\df\00\00\00\b7\00\00\00\aa\00\00\00\d5\00\00\00w\00\00\00\f8\00\00\00\98\00\00\00\02\00\00\00,\00\00\00\9a\00\00\00\a3\00\00\00F\00\00\00\dd\00\00\00\99\00\00\00e\00\00\00\9b\00\00\00\a7\00\00\00+\00\00\00\ac\00\00\00\t\00\00\00\81\00\00\00\16\00\00\00\'\00\00\00\fd\00\00\00\13\00\00\00b\00\00\00l\00\00\00n\00\00\00O\00\00\00q\00\00\00\e0\00\00\00\e8\00\00\00\b2\00\00\00\b9\00\00\00p\00\00\00h\00\00\00\da\00\00\00\f6\00\00\00a\00\00\00\e4\00\00\00\fb\00\00\00\"\00\00\00\f2\00\00\00\c1\00\00\00\ee\00\00\00\d2\00\00\00\90\00\00\00\0c\00\00\00\bf\00\00\00\b3\00\00\00\a2\00\00\00\f1\00\00\00Q\00\00\003\00\00\00\91\00\00\00\eb\00\00\00\f9\00\00\00\0e\00\00\00\ef\00\00\00k\00\00\001\00\00\00\c0\00\00\00\d6\00\00\00\1f\00\00\00\b5\00\00\00\c7\00\00\00j\00\00\00\9d\00\00\00\b8\00\00\00T\00\00\00\cc\00\00\00\b0\00\00\00s\00\00\00y\00\00\002\00\00\00-\00\00\00\7f\00\00\00\04\00\00\00\96\00\00\00\fe\00\00\00\8a\00\00\00\ec\00\00\00\cd\00\00\00]\00\00\00\de\00\00\00r\00\00\00C\00\00\00\1d\00\00\00\18\00\00\00H\00\00\00\f3\00\00\00\8d\00\00\00\80\00\00\00\c3\00\00\00N\00\00\00B\00\00\00\d7\00\00\00=\00\00\00\9c\00\00\00\b4\00\00\00\97\00\00\00\a0\00\00\00\89\00\00\00[\00\00\00Z\00\00\00\0f\00\00\00\83\00\00\00\0d\00\00\00\c9\00\00\00_\00\00\00`\00\00\005\00\00\00\c2\00\00\00\e9\00\00\00\07\00\00\00\e1\00\00\00\8c\00\00\00$\00\00\00g\00\00\00\1e\00\00\00E\00\00\00\8e\00\00\00\08\00\00\00c\00\00\00%\00\00\00\f0\00\00\00\15\00\00\00\n\00\00\00\17\00\00\00\be\00\00\00\06\00\00\00\94\00\00\00\f7\00\00\00x\00\00\00\ea\00\00\00K\00\00\00\00\00\00\00\1a\00\00\00\c5\00\00\00>\00\00\00^\00\00\00\fc\00\00\00\db\00\00\00\cb\00\00\00u\00\00\00#\00\00\00\0b\00\00\00 \00\00\009\00\00\00\b1\00\00\00!\00\00\00X\00\00\00\ed\00\00\00\95\00\00\008\00\00\00W\00\00\00\ae\00\00\00\14\00\00\00}\00\00\00\88\00\00\00\ab\00\00\00\a8\00\00\00D\00\00\00\af\00\00\00J\00\00\00\a5\00\00\00G\00\00\00\86\00\00\00\8b\00\00\000\00\00\00\1b\00\00\00\a6\00\00\00M\00\00\00\92\00\00\00\9e\00\00\00\e7\00\00\00S\00\00\00o\00\00\00\e5\00\00\00z\00\00\00<\00\00\00\d3\00\00\00\85\00\00\00\e6\00\00\00\dc\00\00\00i\00\00\00\\\00\00\00)\00\00\007\00\00\00.\00\00\00\f5\00\00\00(\00\00\00\f4\00\00\00f\00\00\00\8f\00\00\006\00\00\00A\00\00\00\19\00\00\00?\00\00\00\a1\00\00\00\01\00\00\00\d8\00\00\00P\00\00\00I\00\00\00\d1\00\00\00L\00\00\00\84\00\00\00\bb\00\00\00\d0\00\00\00Y\00\00\00\12\00\00\00\a9\00\00\00\c8\00\00\00\c4\00\00\00\87\00\00\00\82\00\00\00t\00\00\00\bc\00\00\00\9f\00\00\00V\00\00\00\a4\00\00\00d\00\00\00m\00\00\00\c6\00\00\00\ad\00\00\00\ba\00\00\00\03\00\00\00@\00\00\004\00\00\00\d9\00\00\00\e2\00\00\00\fa\00\00\00|\00\00\00{\00\00\00\05\00\00\00\ca\00\00\00&\00\00\00\93\00\00\00v\00\00\00~\00\00\00\ff\00\00\00R\00\00\00U\00\00\00\d4\00\00\00\cf\00\00\00\ce\00\00\00;\00\00\00\e3\00\00\00/\00\00\00\10\00\00\00:\00\00\00\11\00\00\00\b6\00\00\00\bd\00\00\00\1c\00\00\00*\00\00\00\df\00\00\00\b7\00\00\00\aa\00\00\00\d5\00\00\00w\00\00\00\f8\00\00\00\98\00\00\00\02\00\00\00,\00\00\00\9a\00\00\00\a3\00\00\00F\00\00\00\dd\00\00\00\99\00\00\00e\00\00\00\9b\00\00\00\a7\00\00\00+\00\00\00\ac\00\00\00\t\00\00\00\81\00\00\00\16\00\00\00\'\00\00\00\fd\00\00\00\13\00\00\00b\00\00\00l\00\00\00n\00\00\00O\00\00\00q\00\00\00\e0\00\00\00\e8\00\00\00\b2\00\00\00\b9\00\00\00p\00\00\00h\00\00\00\da\00\00\00\f6\00\00\00a\00\00\00\e4\00\00\00\fb\00\00\00\"\00\00\00\f2\00\00\00\c1\00\00\00\ee\00\00\00\d2\00\00\00\90\00\00\00\0c\00\00\00\bf\00\00\00\b3\00\00\00\a2\00\00\00\f1\00\00\00Q\00\00\003\00\00\00\91\00\00\00\eb\00\00\00\f9\00\00\00\0e\00\00\00\ef\00\00\00k\00\00\001\00\00\00\c0\00\00\00\d6\00\00\00\1f\00\00\00\b5\00\00\00\c7\00\00\00j\00\00\00\9d\00\00\00\b8\00\00\00T\00\00\00\cc\00\00\00\b0\00\00\00s\00\00\00y\00\00\002\00\00\00-\00\00\00\7f\00\00\00\04\00\00\00\96\00\00\00\fe\00\00\00\8a\00\00\00\ec\00\00\00\cd\00\00\00]\00\00\00\de\00\00\00r\00\00\00C\00\00\00\1d\00\00\00\18\00\00\00H\00\00\00\f3\00\00\00\8d\00\00\00\80\00\00\00\c3\00\00\00N\00\00\00B\00\00\00\d7\00\00\00=\00\00\00\9c\00\00\00\b4\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00")
 (data (i32.const 2092) ",\00\00\00\00\00\00\00\00\00\00\00\03\00\00\00\10\00\00\00 \00\00\00 \00\00\00\00\08\00\00\00\02\00\00\00\00\00\00\00\00\00\00\00\00\00\00")
 (data (i32.const 2140) "<\00\00\00\00\00\00\00\00\00\00\00\01\00\00\00$\00\00\00I\00n\00d\00e\00x\00 \00o\00u\00t\00 \00o\00f\00 \00r\00a\00n\00g\00e\00\00\00\00\00\00\00\00\00")
 (data (i32.const 2204) ",\00\00\00\00\00\00\00\00\00\00\00\01\00\00\00\1a\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00.\00t\00s\00\00\00")
 (table $0 1 1 funcref)
 (elem $0 (i32.const 1))
 (export "perlin" (func $assembly/perlin/perlin))
 (export "memory" (memory $0))
 (func $assembly/perlin/fade (param $t f64) (result f64)
  local.get $t
  local.get $t
  f64.mul
  local.get $t
  f64.mul
  local.get $t
  local.get $t
  f64.const 6
  f64.mul
  f64.const 15
  f64.sub
  f64.mul
  f64.const 10
  f64.add
  f64.mul
 )
 (func $~lib/array/Array<i32>#__get (param $this i32) (param $index i32) (result i32)
  (local $value i32)
  local.get $index
  local.get $this
  i32.load $0 offset=12
  i32.ge_u
  if
   i32.const 2160
   i32.const 2224
   i32.const 114
   i32.const 42
   call $~lib/builtins/abort
   unreachable
  end
  local.get $this
  i32.load $0 offset=4
  local.get $index
  i32.const 2
  i32.shl
  i32.add
  i32.load $0
  local.set $value
  i32.const 0
  drop
  local.get $value
 )
 (func $assembly/perlin/grad (param $hash i32) (param $x f64) (param $y f64) (param $z f64) (result f64)
  (local $var$4 i32)
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
                   local.get $hash
                   i32.const 15
                   i32.and
                   local.set $var$4
                   local.get $var$4
                   i32.const 0
                   i32.eq
                   br_if $case0|0
                   local.get $var$4
                   i32.const 1
                   i32.eq
                   br_if $case1|0
                   local.get $var$4
                   i32.const 2
                   i32.eq
                   br_if $case2|0
                   local.get $var$4
                   i32.const 3
                   i32.eq
                   br_if $case3|0
                   local.get $var$4
                   i32.const 4
                   i32.eq
                   br_if $case4|0
                   local.get $var$4
                   i32.const 5
                   i32.eq
                   br_if $case5|0
                   local.get $var$4
                   i32.const 6
                   i32.eq
                   br_if $case6|0
                   local.get $var$4
                   i32.const 7
                   i32.eq
                   br_if $case7|0
                   local.get $var$4
                   i32.const 8
                   i32.eq
                   br_if $case8|0
                   local.get $var$4
                   i32.const 9
                   i32.eq
                   br_if $case9|0
                   local.get $var$4
                   i32.const 10
                   i32.eq
                   br_if $case10|0
                   local.get $var$4
                   i32.const 11
                   i32.eq
                   br_if $case11|0
                   local.get $var$4
                   i32.const 12
                   i32.eq
                   br_if $case12|0
                   local.get $var$4
                   i32.const 13
                   i32.eq
                   br_if $case13|0
                   local.get $var$4
                   i32.const 14
                   i32.eq
                   br_if $case14|0
                   local.get $var$4
                   i32.const 15
                   i32.eq
                   br_if $case15|0
                   br $case16|0
                  end
                  local.get $x
                  local.get $y
                  f64.add
                  return
                 end
                 local.get $x
                 f64.neg
                 local.get $y
                 f64.add
                 return
                end
                local.get $x
                local.get $y
                f64.sub
                return
               end
               local.get $x
               f64.neg
               local.get $y
               f64.sub
               return
              end
              local.get $x
              local.get $z
              f64.add
              return
             end
             local.get $x
             f64.neg
             local.get $z
             f64.add
             return
            end
            local.get $x
            local.get $z
            f64.sub
            return
           end
           local.get $x
           f64.neg
           local.get $z
           f64.sub
           return
          end
          local.get $y
          local.get $z
          f64.add
          return
         end
         local.get $y
         f64.neg
         local.get $z
         f64.add
         return
        end
        local.get $y
        local.get $z
        f64.sub
        return
       end
       local.get $y
       f64.neg
       local.get $z
       f64.sub
       return
      end
      local.get $y
      local.get $x
      f64.add
      return
     end
     local.get $y
     f64.neg
     local.get $z
     f64.add
     return
    end
    local.get $y
    local.get $x
    f64.sub
    return
   end
   local.get $y
   f64.neg
   local.get $z
   f64.sub
   return
  end
  f64.const 0
  return
 )
 (func $assembly/perlin/lerp (param $t f64) (param $a f64) (param $b f64) (result f64)
  local.get $a
  local.get $t
  local.get $b
  local.get $a
  f64.sub
  f64.mul
  f64.add
 )
 (func $~stack_check
  global.get $~lib/memory/__stack_pointer
  global.get $~lib/memory/__data_end
  i32.lt_s
  if
   i32.const 18656
   i32.const 18704
   i32.const 1
   i32.const 1
   call $~lib/builtins/abort
   unreachable
  end
 )
 (func $assembly/perlin/perlin (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result f64)
  (local $4 f64)
  (local $5 f64)
  (local $6 f64)
  (local $7 f64)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 f64)
  (local $12 f64)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  (local $18 i32)
  (local $19 f64)
  (local $20 i32)
  (local $21 f64)
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.sub
  global.set $~lib/memory/__stack_pointer
  call $~stack_check
  global.get $~lib/memory/__stack_pointer
  i32.const 0
  i32.store $0
  local.get $0
  f64.convert_i32_s
  local.get $3
  f64.convert_i32_s
  f64.div
  local.set $4
  local.get $1
  f64.convert_i32_s
  local.get $3
  f64.convert_i32_s
  f64.div
  local.set $5
  local.get $2
  f64.convert_i32_s
  local.get $3
  f64.convert_i32_s
  f64.div
  local.set $6
  local.get $4
  local.set $7
  local.get $7
  f64.floor
  i32.trunc_sat_f64_s
  i32.const 255
  i32.and
  local.set $8
  local.get $5
  local.set $7
  local.get $7
  f64.floor
  i32.trunc_sat_f64_s
  i32.const 255
  i32.and
  local.set $9
  local.get $6
  local.set $7
  local.get $7
  f64.floor
  i32.trunc_sat_f64_s
  i32.const 255
  i32.and
  local.set $10
  local.get $4
  local.get $4
  local.set $7
  local.get $7
  f64.floor
  f64.sub
  local.set $4
  local.get $5
  local.get $5
  local.set $7
  local.get $7
  f64.floor
  f64.sub
  local.set $5
  local.get $6
  local.get $6
  local.set $7
  local.get $7
  f64.floor
  f64.sub
  local.set $6
  local.get $4
  call $assembly/perlin/fade
  local.set $7
  local.get $5
  call $assembly/perlin/fade
  local.set $11
  local.get $6
  call $assembly/perlin/fade
  local.set $12
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $8
  call $~lib/array/Array<i32>#__get
  local.get $9
  i32.add
  local.set $13
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $13
  call $~lib/array/Array<i32>#__get
  local.get $10
  i32.add
  local.set $14
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $13
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $10
  i32.add
  local.set $15
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $8
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $9
  i32.add
  local.set $16
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $16
  call $~lib/array/Array<i32>#__get
  local.get $10
  i32.add
  local.set $17
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $16
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $10
  i32.add
  local.set $18
  local.get $12
  local.get $11
  local.get $7
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $14
  call $~lib/array/Array<i32>#__get
  local.get $4
  local.get $5
  local.get $6
  call $assembly/perlin/grad
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $17
  call $~lib/array/Array<i32>#__get
  local.get $4
  f64.const 1
  f64.sub
  local.get $5
  local.get $6
  call $assembly/perlin/grad
  call $assembly/perlin/lerp
  local.get $7
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $15
  call $~lib/array/Array<i32>#__get
  local.get $4
  local.get $5
  f64.const 1
  f64.sub
  local.get $6
  call $assembly/perlin/grad
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $18
  call $~lib/array/Array<i32>#__get
  local.get $4
  f64.const 1
  f64.sub
  local.get $5
  f64.const 1
  f64.sub
  local.get $6
  call $assembly/perlin/grad
  call $assembly/perlin/lerp
  call $assembly/perlin/lerp
  local.get $11
  local.get $7
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $14
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $4
  local.get $5
  local.get $6
  f64.const 1
  f64.sub
  call $assembly/perlin/grad
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $17
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $4
  f64.const 1
  f64.sub
  local.get $5
  local.get $6
  f64.const 1
  f64.sub
  call $assembly/perlin/grad
  call $assembly/perlin/lerp
  local.get $7
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $15
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $4
  local.get $5
  f64.const 1
  f64.sub
  local.get $6
  f64.const 1
  f64.sub
  call $assembly/perlin/grad
  global.get $assembly/perlin/p
  local.set $20
  global.get $~lib/memory/__stack_pointer
  local.get $20
  i32.store $0
  local.get $20
  local.get $18
  i32.const 1
  i32.add
  call $~lib/array/Array<i32>#__get
  local.get $4
  f64.const 1
  f64.sub
  local.get $5
  f64.const 1
  f64.sub
  local.get $6
  f64.const 1
  f64.sub
  call $assembly/perlin/grad
  call $assembly/perlin/lerp
  call $assembly/perlin/lerp
  call $assembly/perlin/lerp
  local.set $19
  local.get $19
  f64.const 1
  f64.add
  f64.const 2
  f64.div
  local.set $21
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.add
  global.set $~lib/memory/__stack_pointer
  local.get $21
 )
)

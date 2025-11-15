#!/usr/bin/expect -f
set timeout 60
set server "195.35.16.131"
set user "root"
set password "SisaaTTech1@"

spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $user@$server

expect {
    "password:" { send "$password\r"; exp_continue }
    "Password:" { send "$password\r"; exp_continue }
    "# " { }
    timeout { puts "Timeout"; exit 1 }
}

# Encontrar backend
send "find /opt -type d -name backend 2>/dev/null | head -1\r"
expect {
    -re "(/.*backend)" {
        set backend_dir $expect_out(1,string)
        send_user "Backend: $backend_dir\n"
        send "cd $backend_dir\r"
        expect "# "
        
        send "cp .env .env.backup\r"
        expect "# "
        
        send "echo 'DB_SCHEMA_PROD=cursos' >> .env\r"
        expect "# "
        
        send "grep DB_SCHEMA_PROD .env\r"
        expect "# "
        
        send "pm2 restart backend\r"
        expect {
            -re ".*" { send_user "Reiniciado\n" }
            "# " { }
        }
        expect "# "
        
        send "exit\r"
        expect eof
    }
    "# " {
        send "ls -la /opt/\r"
        expect "# "
        send "exit\r"
        expect eof
    }
}


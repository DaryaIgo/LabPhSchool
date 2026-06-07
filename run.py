#!/usr/bin/env python3
"""Удобный скрипт для управления проектом Ph."""

import argparse
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent / "app"


def run(cmd: list[str], cwd: Path = PROJECT_ROOT) -> int:
    """Выполнить команду и вернуть код возврата."""
    print(f"\n\033[1;34m▶ {' '.join(cmd)}\033[0m")
    try:
        return subprocess.call(cmd, cwd=cwd)
    except FileNotFoundError as e:
        print(f"\033[1;31mОшибка: команда не найдена — {e.filename}\033[0m")
        return 1


def get_pid_on_port(port: int = 3000) -> list[int]:
    """Найти PID процессов, занимающих указанный порт."""
    try:
        result = subprocess.run(
            ["lsof", "-ti", f":{port}"],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode == 0 and result.stdout.strip():
            return [int(p) for p in result.stdout.strip().split("\n") if p.strip()]
    except FileNotFoundError:
        pass
    return []


def cmd_dev(_):
    """Запуск dev-сервера (требуется запущенный MySQL)."""
    sys.exit(run(["npm", "run", "dev"]))


def cmd_build(_):
    """Сборка production."""
    sys.exit(run(["npm", "run", "build"]))


def cmd_start(_):
    """Запуск production-сервера."""
    sys.exit(run(["npm", "run", "start"]))


def cmd_setup(_) -> int:
    """Полная настройка: зависимости → миграции → сид."""
    steps = [
        (["npm", "install"], "Установка зависимостей"),
        (["npm", "run", "db:migrate"], "Применение миграций БД"),
        (["npx", "tsx", "db/seed.ts"], "Заполнение начальными данными"),
    ]
    for cmd, desc in steps:
        print(f"\n\033[1;33m● {desc}…\033[0m")
        code = run(cmd)
        if code != 0:
            print(f"\033[1;31m✖ Ошибка на шаге: {desc}\033[0m")
            return code
    print("\n\033[1;32m✓ Готово! Теперь запустите: python3 run.py dev\033[0m")
    return 0


def cmd_stop(_) -> int:
    """Остановить dev-сервер (порт 3000)."""
    pids = get_pid_on_port(3000)
    if not pids:
        print("\033[1;33m⚑ Сервер на порту 3000 не найден.\033[0m")
        return 0
    for pid in pids:
        try:
            subprocess.run(["kill", "-9", str(pid)], check=False)
            print(f"\033[1;32m✓ Остановлен процесс {pid}\033[0m")
        except Exception as e:
            print(f"\033[1;31m✖ Не удалось остановить {pid}: {e}\033[0m")
    return 0


def cmd_restart(_) -> int:
    """Перезапустить dev-сервер."""
    cmd_stop(None)
    print("\n\033[1;33m↻ Перезапуск…\033[0m")
    return cmd_dev(None)


def cmd_full(args) -> int:
    """Полный цикл: setup + dev или setup + build + start."""
    code = cmd_setup(args)
    if code != 0:
        return code
    if args.production:
        code = cmd_build(args)
        if code != 0:
            return code
        return cmd_start(args)
    return cmd_dev(args)


def main():
    parser = argparse.ArgumentParser(
        description="Управление проектом Ph",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("dev", help="Запустить dev-сервер (npm run dev)")
    sub.add_parser("build", help="Собрать production (npm run build)")
    sub.add_parser("start", help="Запустить production (npm run start)")
    sub.add_parser("setup", help="Установить зависимости, миграции и сид")
    sub.add_parser("stop", help="Остановить dev-сервер (порт 3000)")
    sub.add_parser("restart", help="Перезапустить dev-сервер")

    p_full = sub.add_parser("full", help="setup + (dev или production)")
    p_full.add_argument(
        "--production", "-p", action="store_true", help="После setup собрать и запустить production"
    )

    args = parser.parse_args()

    handlers = {
        "dev": cmd_dev,
        "build": cmd_build,
        "start": cmd_start,
        "setup": cmd_setup,
        "stop": cmd_stop,
        "restart": cmd_restart,
        "full": cmd_full,
    }

    sys.exit(handlers[args.command](args))


if __name__ == "__main__":
    main()

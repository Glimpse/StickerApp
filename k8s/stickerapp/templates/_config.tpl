{{- define "redis-env" -}}
- name: REDIS_HOST
  value: "{{ template "redis.host" . }}"
- name: REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: "{{ template "redis.host" . }}"
      key: redis-password
- name: REDIS_PORT
  value: "{{default 6379 .Values.redisPort}}"
{{- if not .Values.local.redis }}
- name: REDIS_TLS_SERVERNAME
  value: "{{ template "redis.host" . }}"
{{- end -}}
{{- end -}}
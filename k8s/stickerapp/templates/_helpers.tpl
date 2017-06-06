{{- define "stickerapp.common.labels" -}}
app: "stickerapp"
chart: "{{ .Chart.Name }}-{{ .Chart.Version }}"
heritage: "{{ .Release.Service }}"
release: "{{ .Release.Name }}"
{{- end -}}

{{- define "activeDirectory.secret.name" -}}
{{- printf "%s-adb2c-secrets" .Release.Name | trunc 24 | trimSuffix "-" -}}
{{- end -}}

{{- define "kafka.broker" -}}
{{- printf "%s-broker-kf" .Release.Name -}}
{{- end -}}

{{- define "kafka.topic" -}}
{{- default "sticker-popularity" .Values.kafkaTopic -}}
{{- end -}}

{{- define "mongo.connectionString" -}}
{{ if .Values.local.mongodb }}
{{- printf "mongodb://%s-%s:27017" .Release.Name "mongodb" -}}
{{ else }}
{{- .Values.mongoConnectionString -}}
{{ end }}
{{- end -}}

{{- define "mysql.connectionString" -}}
{{ if .Values.local.mysql }}
{{- printf "mysql://root@%s-mysql/StickerDemoApp" .Release.Name -}}
{{ else }}
{{- .Values.mysqlConnectionString -}}
{{ end }}
{{- end -}}

{{- define "redis.host" -}}
{{ if .Values.local.redis }}
{{- printf "%s-%s" .Release.Name "redis" -}}
{{ else }}
{{- .Values.redisHost -}}
{{ end }}
{{- end -}}

{{- define "registry.name" -}}
{{ if .Values.registry }}
{{- printf "%s/" .Values.registry -}}
{{ end }}
{{- end -}}

{{- define "registry.secret.name" -}}
{{- printf "%s-stickerapp-registry-secret" .Release.Name -}}
{{- end -}}

{{- define "zookeeper.service.name" -}}
{{- printf "%s-zookeeper-zk" .Release.Name -}}
{{- end -}}
